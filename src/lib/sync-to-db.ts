// /lib/sync-to-db.ts

import { EmailAddress, GmailMessage, getToField, EmailAttachment } from "~/types";
import { db } from '~/server/db';
import pLimit from 'p-limit';
import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });




export async function syncEmailsToDatabase(emails: GmailMessage[], accountId: string) {
    console.log('Attempting to sync emails to database', emails.length,'for account', accountId);
    const limit = pLimit(10); // Limit concurrent database writes

    try {
        // Process each email in parallel with a limit of 10 concurrent writes
        await Promise.all(emails.map((email, index) => limit(async () => {
            // Print each email before upserting
            await upsertEmail(email, accountId, index);
        })));
        }
    
     catch (error) {
        console.log('Error in syncEmailsToDatabase:', error);
    }
}


function determineLabelType(message: GmailMessage) {
    if (!message.labelIds || !Array.isArray(message.labelIds)) {
        console.error("No labelIds found for email", message.id);
        return undefined;
    }

    if (message.labelIds.includes("INBOX")) {
        return 'inbox';
    } else if (message.labelIds.includes("SENT")) {
        return 'sent';
    } else if (message.labelIds.includes("DRAFT")) {
        return 'draft';
    }
    // Add other conditions if needed
    return undefined;
}


async function upsertEmail(email: GmailMessage, accountId: string, index: number) {
    console.log('Upserting email', index);

    try {
        // Extract info about the email
        const labelIds = determineLabelType(email);
        const headers = email.payload?.headers;
        const toField = getToField(email);
        const fromField = headers?.find(header => header.name === 'From')?.value;
        const replyToField = headers?.find(header => header.name === 'Reply-To')?.value;
        const subject = headers?.find(header => header.name === 'Subject')?.value;
        const date = new Date(parseInt(email.internalDate));
        const body = email.payload?.body?.data;
        const attachments = email.payload?.parts?.filter(part => part.filename);
        const messageid = email.payload?.headers?.find(header => header.name === 'Message-ID')?.value;
        // Extract the date and time part
        const receivedHeader = headers?.find(header => header.name === 'Received')?.value;
        const dateTimeRegex = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)/;
        const match = receivedHeader ? receivedHeader.match(dateTimeRegex) : null;
        if (match && match[1]) {
            const dateTimeString = match[1];
            const receivedTime = new Date(dateTimeString);
            const attachments = email.payload.parts?.filter(part => part.filename);
        
            
        

        

        // 2. Upsert Thread
        const thread = await db.thread.upsert({
            where: { id: email.threadId },
            update: {
                subject: email.subject || '',
                accountId,
                lastMessageDate: new Date(email.internalDate),
                done: false,
                participantIds: [...new Set([
                    toField,
                    fromField,
                ].filter(id => id !== undefined))]
            },
            create: {
                id: email.threadId,
                accountId,
                subject: email.subject || '',
                done: false,
                draftStatus: labelIds === 'draft',
                inboxStatus: labelIds === 'inbox',
                sentStatus: labelIds === 'sent',
                lastMessageDate: new Date(email.internalDate),
                participantIds: [...new Set([
                    toField,
                    fromField,
                ].filter(id => id !== undefined))]
            }
        });

       
        // 3. Upsert Email
        await db.email.upsert({
            where: { id: email.id },
            update: {
                threadId: thread.id,
                createdTime: new Date(email.internalDate),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.internalDate),
                receivedAt: receivedTime,
                internetMessageId: messageid || '',
                subject: email.subject || '',
                sysLabels: email.labelIds,
                fromId: fromField,
                to: toField ? { create: [{ address: toField, accountId }] } : undefined,
                replyTo: replyToField ? { create: [{ address: replyToField, accountId }] } : undefined,
                internetHeaders: email.payload.headers as any,
                body: body,
                bodySnippet: email.snippet,
                inReplyTo: replyToField,
                emailLabel: determineLabelType(email) as typeof labelIds,
                hasAttachments: !!attachments?.length,
            },
            create: {
                id: email.id,
                threadId: thread.id,
                createdTime: new Date(email.internalDate),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.internalDate),
                receivedAt: receivedTime,
                internetMessageId: messageid || '',
                subject: email.subject || '',
                sysLabels: email.labelIds,
                fromId: fromField|| '',
                to: toField ? { create: [{ address: toField, accountId }] } : undefined,
                replyTo: replyToField ? { create: [{ address: replyToField, accountId }] } : undefined,
                internetHeaders: email.payload.headers as any,
                body: email.payload.body.data,
                bodySnippet: email.snippet,
                inReplyTo: replyToField,
                emailLabel: determineLabelType(email),
                hasAttachments: !!attachments?.length,
            }
        });

        const threadEmails = await db.email.findMany({
            where: { threadId: thread.id },
            orderBy: { receivedAt: 'asc' }
        });

        let threadFolderType = 'sent';
        for (const threadEmail of threadEmails) {
            if (threadEmail.emailLabel === 'inbox') {
                threadFolderType = 'inbox';
                break; // If any email is in inbox, the whole thread is in inbox
            } else if (threadEmail.emailLabel === 'draft') {
                threadFolderType = 'draft'; // Set to draft, but continue checking for inbox
            }
        }
        await db.thread.update({
            where: { id: thread.id },
            data: {
                draftStatus: threadFolderType === 'draft',
                inboxStatus: threadFolderType === 'inbox',
                sentStatus: threadFolderType === 'sent',
            }
        });

        if (attachments) {
            try{for (const attachment of attachments) {
                // 4. Upsert Attachments
                for (const attachment of attachments) {
                    const emailAttachment: EmailAttachment = {
                        id: attachment.partId,
                        name: attachment.filename || '',
                        mimeType: attachment.mimeType || '',
                        size: attachment.body?.size || 0,
                        inline: !!attachment.headers?.find(header => header.name === 'Content-Disposition' && header.value.includes('inline')),
                        contentId: attachment.headers?.find(header => header.name === 'Content-ID')?.value || '',
                        content: attachment.body?.data || '',
                        contentLocation: attachment.headers?.find(header => header.name === 'Content-Location')?.value || '',
                    };
                    await upsertAttachment(email.id, emailAttachment);
                }
            }}catch (error) {
                 if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    console.log(`Prisma error for email ${email.id}: ${error.message}`);
                } else {
                    console.log(`Unknown error for email ${email.id}: ${error}`);
                    }
                }  
            
            }
         
    
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
    try {
        await db.emailAttachment.upsert({
            where: { id: attachment.id ?? "" },
            update: {
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                content: attachment.content,
                contentLocation: attachment.contentLocation,
            },
            create: {
                id: attachment.id,
                emailId,
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                content: attachment.content,
                contentLocation: attachment.contentLocation,
            },
        });
    } catch (error) {
        console.log(`Failed to upsert attachment for email ${emailId}: ${error}`);
    }
}

async function upsertEmailAddresses(address : EmailAddress,accountId: string){
    try {
        const existingAddress = await db.emailAddress.findUnique({
            where: { accountId_address: {accountId :accountId, address: address.address ??""}}, 
        });

        if(existingAddress){
            return await db.emailAddress.findUnique({
                where: {id:existingAddress.id},
            });
        }else{
            return await db.emailAddress.create({
                data: {address:address.address??"",name:address.name,accountId},
            });
        }
    } catch (error) {
        console.log('Error upserting email address upsertEmailAddresses function', error)
    }
}
    } catch (error) {
        console.log('Error upserting email upsertEmail function', error)
    }
}
