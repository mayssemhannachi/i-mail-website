<<<<<<< HEAD
import { EmailAddress, GmailMessage, getToField, EmailAttachment } from "~/types";
import { db } from '~/server/db';
import pLimit from 'p-limit';
import { PrismaClient, Prisma } from '@prisma/client';
import TurndownService from 'turndown';


const turndownService = new TurndownService();

async function syncEmailsToDatabase(emails: GmailMessage[], accountId: string) {
    console.log('Attempting to sync emails to database', emails.length, 'for account', accountId);
    const limit = pLimit(10); // Limit concurrent database writes

    try {
        // Process each email in parallel with a limit of 10 concurrent writes
        async function syncToDB() {
            for (const [index, email] of emails.entries()) {
                await upsertEmail(email, accountId, index);
            }
        }
        await Promise.all([syncToDB()]);
    } catch (error) {
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

async function getEmailBody(message: GmailMessage) {
    try {
        if (message.payload) {
            const payload = message.payload;

            // Check if the message has multiple parts (attachments, inline images, etc.)
            if (payload.parts) {
                for (const part of payload.parts) {
                    if (part.mimeType === 'text/plain' && part.body?.data) {
                        // Decode plain text body from base64
                        const bodyData = part.body.data;
                        const bodyText = Buffer.from(bodyData, 'base64').toString('utf-8');
                        return bodyText;
                    } else if (part.mimeType === 'text/html' && part.body?.data) {
                        // Decode HTML body if available
                        const bodyData = part.body.data;
                        const bodyHtml = Buffer.from(bodyData, 'base64').toString('utf-8');
                        const bodyText = turndownService.turndown(bodyHtml);
                        return bodyText;
                    }
                }
            } else if (payload.body?.data) {
                // Fallback for messages without parts
                const bodyData = payload.body.data;
                const bodyText = Buffer.from(bodyData, 'base64').toString('utf-8');
                return bodyText;
            }
        }

        return null; // Return null if no body is found
    } catch (error) {
        console.error('Error retrieving email body:', error);
        return null;
    }
}

async function upsertEmail(email: GmailMessage, accountId: string, index: number) {
    try {
        console.log('Upserting email', index);
        // Extract info about the email
        const threadId = email.threadId;
        console.log('Thread ID:', threadId);
        const labelIds = determineLabelType(email);
        console.log('Label IDs:', labelIds);
        const headers = email.payload?.headers;
        const toField = getToField(email);
        console.log('To Field:', toField);
        const fromField = headers?.find(header => header.name === 'From')?.value;
        console.log('From Field:', fromField);
        const replyToField = headers?.find(header => header.name === 'Reply-To')?.value;
        console.log('Reply-To Field:', replyToField);
        const subject = headers?.find(header => header.name === 'Subject')?.value;
        console.log('Subject:', subject);
        const date = headers?.find(header => header.name === 'Date')?.value;
        console.log('Date:', date);
        const body = await getEmailBody(email);
        console.log('Body:', body);
        const attachments = email.payload?.parts?.filter(part => part.filename);
        console.log('Attachments:', attachments);
        const messageid = email.payload?.headers?.find(header => header.name === 'Message-ID')?.value;
        console.log('Message ID:', messageid);
        console.log('internalDate:', email.internalDate); // Add this line
        // Extract the date and time part
        const receivedHeader = headers?.find(header => header.name === 'Received')?.value;
        const dateTimeRegex = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)/;
        const match = receivedHeader ? receivedHeader.match(dateTimeRegex) : null;
        console.log('Received time:', match && match[1]);
        let dateTimeString: string | undefined;
        let receivedTime: Date | undefined;
        if (match && match[1]) {
            dateTimeString = match[1];
            receivedTime = new Date(dateTimeString);
            const attachments = email.payload.parts?.filter(part => part.filename);
            console.log('Received Time:', receivedTime);
            console.log('Attachments:', attachments);
            
        }else{
            receivedTime=new Date();
=======
import { EmailAddress, EmailMessage, EmailAttachment } from "~/types";
import { Email, PrismaClient } from "@prisma/client";
import pLimit from "p-limit";
import { db } from "~/server/db";
import { Prisma } from "@prisma/client";

export async function syncEmailsToDatabase(emails: EmailMessage[], accountId: string) {
    console.log("Attempting to sync emails to database", emails.length); // Log le nombre d'e-mails à synchroniser
    const limit = pLimit(10); // Limite du nombre de requêtes concurrentes
    try {
        await Promise.all(emails.map((email, index) => limit(() => upsertEmail(email, accountId, index))));
    } catch (error) {
        console.log("Error in syncEmailsToDatabase", error); // Log de toute erreur lors de la synchronisation
    }
}

async function upsertEmail(email: EmailMessage, accountId: string, index: number) {
    console.log("Upserting email", index, "with subject:", email.subject); // Log de chaque e-mail traité
    try {
        let emailLabelType: "inbox" | "sent" | "draft" = "inbox";
        if (email.sysLabels.includes("sent")) {
            emailLabelType = "sent";
        } else if (email.sysLabels.includes("draft")) {
            emailLabelType = "draft";
        }

        // Log les labels pour déboguer
        console.log("Email Labels:", email.sysLabels);
        
        const addressesToUpsert = new Map<string, EmailAddress>();
        for (const address of [email.from, ...email.to, ...email.cc, ...email.bcc, ...email.replyTo]) {
            addressesToUpsert.set(address.address, address);
>>>>>>> 2b782a8 (Reglage)
        }
        const isoDate = date ? new Date(date).toISOString() : null;

<<<<<<< HEAD
        // 1. Upsert EmailAddress records
        console.log("This is an informational message!");
        
        const upsertedAddresses = await upsertEmailAddresses(
            {
                deliveredTo: email.payload.headers.find(header => header.name === 'Delivered-To')?.value,
                replyTo: email.payload.headers.find(header => header.name === 'Reply-To')?.value,
                from: email.payload.headers.find(header => header.name === 'From')?.value,
            },
            accountId
        );

        // Get the `fromId` from the upserted "from" address
        const fromAddress = upsertedAddresses.find(address => address.address === fromField);
        const fromId = fromAddress ? fromAddress.id : null;
=======
        const upsertedAddresses: Record<string, any> = {};
        for (const address of addressesToUpsert.values()) {
            const upsertedAddress = await upsertEmailAddress(address, accountId);
            if (upsertedAddress) upsertedAddresses[address.address] = upsertedAddress;
        }

        // Vérifie l'adresse 'from'
        const fromAddress = upsertedAddresses[email.from.address];
        if (!fromAddress) {
            console.log(`Failed to upsert 'from' address for email ${email.bodySnippet}`);
            return;
        }

        const toAddresses = email.to.map(addr => upsertedAddresses[addr.address]).filter(Boolean);
        const ccAddresses = email.cc.map(addr => upsertedAddresses[addr.address]).filter(Boolean);
        const bccAddresses = email.bcc.map(addr => upsertedAddresses[addr.address]).filter(Boolean);
        const replyToAddresses = email.replyTo.map(addr => upsertedAddresses[addr.address]).filter(Boolean);
>>>>>>> 2b782a8 (Reglage)

        const thread = await db.thread.upsert({
            where: { id: email.threadId },
            update: {
                subject: subject ,
                accountId,
                lastMessageDate: isoDate,
                done: false,
<<<<<<< HEAD
                participantIds: [...new Set([
                    toField,
                    fromField,
                ].filter(id => id !== undefined))]
=======
                participantIds: [...new Set([fromAddress.id, ...toAddresses, ...ccAddresses, ...bccAddresses])],
>>>>>>> 2b782a8 (Reglage)
            },
            create: {
                id: email.threadId,
                accountId,
                subject: subject,
                done: false,
<<<<<<< HEAD
                draftStatus: labelIds === 'draft',
                inboxStatus: labelIds === 'inbox',
                sentStatus: labelIds === 'sent',
                lastMessageDate: isoDate,
                participantIds: [...new Set([
                    toField,
                    fromField,
                ].filter(id => id !== undefined))]
            }
=======
                draftStatus: emailLabelType === "draft",
                inboxStatus: emailLabelType === "inbox",
                sentStatus: emailLabelType === "sent",
                lastMessageDate: new Date(email.sentAt),
                participantIds: [...new Set([fromAddress.id, ...toAddresses, ...ccAddresses, ...bccAddresses])],
            },
>>>>>>> 2b782a8 (Reglage)
        });

        // Log le thread créé ou mis à jour
        console.log(`Thread upserted/updated with id: ${thread.id}`);

        // Insertion ou mise à jour de l'e-mail
        await db.email.upsert({
            where: { id: email.id },
            update: {
                threadId: thread.id,
<<<<<<< HEAD
                createdTime: isoDate ?? new Date(),
                lastModifiedTime: isoDate ?? new Date(),
                sentAt: isoDate ? new Date(isoDate) : new Date(),
                receivedAt: receivedTime,
                internetMessageId: messageid || '',
                subject: subject || '',
                sysLabels: email.labelIds,
                fromId: fromField || '',
                to: toField ? { create: [{ address: toField, accountId }] } : undefined,
                replyTo: replyToField ? { create: [{ address: replyToField, accountId }] } : undefined,
                internetHeaders: email.payload.headers as any,
                body: body,
                bodySnippet: email.snippet,
                inReplyTo: replyToField,
                emailLabel: determineLabelType(email) as typeof labelIds,
                hasAttachments: !!attachments?.length,
=======
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                keywords: email.keywords,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                fromId: fromAddress.id,
                to: { set: toAddresses.map(a => ({ id: a.id })) },
                cc: { set: ccAddresses.map(a => ({ id: a.id })) },
                bcc: { set: bccAddresses.map(a => ({ id: a.id })) },
                replyTo: { set: replyToAddresses.map(a => ({ id: a.id })) },
                hasAttachments: email.hasAttachments,
                internetHeaders: email.internetHeaders as any,
                body: email.body,
                bodySnippet: email.bodySnippet,
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties as any,
                folderId: email.folderId,
                omitted: email.omitted,
                emailLabel: emailLabelType,
>>>>>>> 2b782a8 (Reglage)
            },
            create: {
                id: email.id,
                threadId: thread.id,
<<<<<<< HEAD
                createdTime: isoDate ?? new Date(),
                lastModifiedTime: isoDate ? new Date(isoDate) : new Date(),
                sentAt: isoDate ? new Date(isoDate) : new Date(),
                receivedAt: receivedTime,
                internetMessageId: messageid || '',
                subject: subject || '',
                sysLabels: email.labelIds,
                fromId: fromId || '',
                to: toField ? { create: [{ address: toField, accountId }] } : undefined,
                replyTo: replyToField ? { create: [{ address: replyToField, accountId }] } : undefined,
                internetHeaders: email.payload.headers as any,
                body: body,
                bodySnippet: email.snippet,
                inReplyTo: replyToField,
                emailLabel: determineLabelType(email) as typeof labelIds,
                hasAttachments: !!attachments?.length,

            }
=======
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                internetHeaders: email.internetHeaders as any,
                keywords: email.keywords,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                fromId: fromAddress.id,
                to: { connect: toAddresses.map(a => ({ id: a.id })) },
                cc: { connect: ccAddresses.map(a => ({ id: a.id })) },
                bcc: { connect: bccAddresses.map(a => ({ id: a.id })) },
                replyTo: { connect: replyToAddresses.map(a => ({ id: a.id })) },
                hasAttachments: email.hasAttachments,
                body: email.body,
                bodySnippet: email.bodySnippet,
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties as any,
                folderId: email.folderId,
                omitted: email.omitted,
            },
>>>>>>> 2b782a8 (Reglage)
        });

        // Vérification du thread de l'email
        const threadEmails = await db.email.findMany({
            where: { threadId: thread.id },
            orderBy: { receivedAt: "asc" },
        });

        let threadFolderType = "sent";
        for (const threadEmail of threadEmails) {
            if (threadEmail.emailLabel === "inbox") {
                threadFolderType = "inbox";
                break;
            } else if (threadEmail.emailLabel === "draft") {
                threadFolderType = "draft";
            }
        }

        await db.thread.update({
            where: { id: thread.id },
            data: {
                draftStatus: threadFolderType === "draft",
                inboxStatus: threadFolderType === "inbox",
                sentStatus: threadFolderType === "sent",
            },
        });

<<<<<<< HEAD
        if (attachments) {
            try {
                for (const attachment of attachments) {
                    // 4. Upsert Attachments
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
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    console.log(`Prisma error for email ${email.id}: ${error.message}`);
                } else {
                    console.log(`Unknown error for email ${email.id}: ${error}`);
                }
            }
        }
    } catch (error) {
        console.log('Error upserting email upsertEmail function', error);
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

async function upsertEmailAddresses(
    addresses: { deliveredTo?: string; replyTo?: string; from?: string },
    accountId: string
) {
    const { deliveredTo, replyTo, from } = addresses;
    const emailFields = [deliveredTo, replyTo, from];

    const results = await Promise.all(
        emailFields.map(async (emailAddress) => {
            if (!emailAddress) return null; // Skip if address is not provided

            try {
                // Use upsert to handle the conflict without throwing an error
                return await db.emailAddress.upsert({
                    where: { accountId_address: { accountId, address: emailAddress } },
                    update: { address: emailAddress }, // Update if it exists
                    create: { address: emailAddress, accountId }, // Create if it doesn't exist
                });
            } catch (error) {
                console.error(`Error upserting email address (${emailAddress}):`, error);
                throw error;
            }
        })
    );

    // Filter out any null values from results (i.e., skipped addresses)
    return results.filter((result) => result !== null);
}





export { syncEmailsToDatabase }

// Test the database connection
async function testDatabaseConnection() {
    try {
        await db.$connect();
        console.log('Database connection successful');
    } catch (error) {
        console.log('Database connection failed:', error);
    } finally {
        await db.$disconnect();
    }
}

testDatabaseConnection();
=======
        // Mise à jour des pièces jointes
        for (const attachment of email.attachments) {
            await upsertAttachment(email.id, attachment);
        }

    } catch (error) {
        // Capture d'erreurs
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.log(`Prisma error for email ${email.id}: ${error.message}`);
        } else {
            console.log(`Unknown error for email ${email.id}: ${error}`);
        }
    }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
    try {
        const existingAddress = await db.emailAddress.findUnique({
            where: { accountId_address: { accountId, address: address.address ?? "" } },
        });

        if (existingAddress) {
            return await db.emailAddress.update({
                where: { id: existingAddress.id },
                data: { name: address.name, raw: address.raw },
            });
        } else {
            return await db.emailAddress.create({
                data: { address: address.address ?? "", name: address.name, raw: address.raw, accountId },
            });
        }
    } catch (error) {
        console.log("Failed to upsert email address:", error);
        return null;
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
        console.log("Failed to upsert attachment:", error);
    }
}
>>>>>>> 2b782a8 (Reglage)
