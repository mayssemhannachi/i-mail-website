// lib/account.ts

import axios from 'axios';
import { GmailMessage } from '~/types';
import { encode as base64Encode } from 'base-64';
import { db } from '~/server/db';
import { syncEmailsToDatabase } from './sync-to-db';

export class Account {
    private token: string;
    private refreshToken: string;
    private clientId: string;
    private clientSecret: string;

    constructor(token: string, refreshToken: string, clientId: string, clientSecret: string) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    // Function to refresh the access token
    private async refreshAccessToken() {
        try {
            const response = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: this.refreshToken,
                grant_type: 'refresh_token',
            });

            this.token = response.data.access_token;
            console.log('Access token refreshed:', this.token);
        } catch (error) {
            console.error('Error refreshing access token:', error);
            throw error;
        }
    }

    // Fetch emails from the last 2 days
    private async startSync() {
        try {
            const response = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params: {
                    maxResults: 20,
                    q: 'newer_than:4d',
                    includeSpamTrash: false
                }
            });

            const messageIds = response.data.messages.map((msg: { id: string }) => msg.id);

            // Fetch details of each message
            const messages = await Promise.all(messageIds.map(async (id: string) => {
                const messageResponse = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        format : 'full'
                    }
                });
                return messageResponse.data;
            }));

            return { messages, nextPageToken: response.data.nextPageToken };
        } catch (error) {
            console.error('Error during startSync in Account.ts', error);
            throw error;
        }
    }

    // Fetch updated emails with pagination support
    async getUpdatedEmails({ pageToken }: { pageToken?: string }): Promise<{ messages: GmailMessage[], nextPageToken?: string }> {
        try {
            const params: Record<string, string> = {
                maxResults: '10',
                q: 'newer_than:2d', // Fetch emails from last 2 days
                includeSpamTrash: 'true',
            };
    
            if (pageToken) params.pageToken = pageToken;
    
            const response = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params,
            });
    
            console.log('API Response:', response.data);
    
            // Check if messages field exists
            if (!response.data.messages) {
                console.warn('No messages found.');
                return { messages: [], nextPageToken: response.data.nextPageToken };
            }
    
            const messageIds = response.data.messages.map((msg: { id: string }) => msg.id);
    
            // Fetch details of each message
            const messages = await Promise.all(messageIds.map(async (id: string) => {
                const messageResponse = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                return messageResponse.data;
            }));
    
            return { messages, nextPageToken: response.data.nextPageToken };
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error:', error.response?.data || error.message);
                if (error.response?.status === 401) {
                    console.error('Unauthorized request. Token may have expired.');
                    await this.refreshAccessToken();
                    return this.getUpdatedEmails({ pageToken }); // Retry the request after refreshing the token
                } else if (error.response?.status === 429) {
                    console.error('Rate limit exceeded. Consider retrying after a delay.');
                }
            } else {
                console.error('Unexpected error during getUpdatedEmails:', error);
            }
            throw error;
        }
    }

    // Perform the initial synchronization process
    async performInitialSync() {
        try {
            console.log('Starting initial sync performInitialSync');
            // Start the initial sync process
            const syncResponse = await this.startSync();
            console.log('got sync response',syncResponse)

            if (!syncResponse || !syncResponse.nextPageToken) {
                throw new Error('No nextPageToken found');
            }else{
                console.log('found nextpagetoken',syncResponse.nextPageToken)
            }

            // Save the delta token (nextPageToken) for future syncs
            let storedDeltaToken = syncResponse.nextPageToken;

            // Retrieve all emails, handling pagination if required
            let allEmails: GmailMessage[] = syncResponse.messages;
            let updatedResponse = await this.getUpdatedEmails({ pageToken: storedDeltaToken });

            while (updatedResponse.nextPageToken) {
                updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken });
                allEmails = allEmails.concat(updatedResponse.messages);
                console.log('got all emails')

                if (updatedResponse.nextPageToken) {
                    storedDeltaToken = updatedResponse.nextPageToken;
                }
            }

            console.log('Initial sync completed. Synced', allEmails.length, 'emails');
             

           
            console.log('Delta token:', storedDeltaToken);

            return {
                emails: allEmails,
                deltaToken: storedDeltaToken
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error during performInitialSync in Account.ts', JSON.stringify(error.response?.data, null, 2));
            } else {
                console.error('Error during performInitialSync in Account.ts', error);
            }
            throw error;
        }
    }

    // Helper function to format email addresses
    private formatEmailAddresses(emails: EmailAddress[]): string {
        return emails.map(email => `${email.name} <${email.address}>`).join(', ');
    }

    // Helper function to validate email addresses
    private validateEmailAddresses(emails: EmailAddress[]): EmailAddress[] {
        const emailSet = new Set<string>();
        const validEmails: EmailAddress[] = [];

        emails.forEach(email => {
            const formattedEmail = `${email.name} <${email.address}>`;
            if (!emailSet.has(formattedEmail)) {
                emailSet.add(formattedEmail);
                validEmails.push(email);
            }
            console.log('Validated email:', email);
        });

        return validEmails;
    }

    async syncEmails() {
        try {
            const account = await db.account.findUnique({
                where: { token: this.token }
            });
            if (!account) throw new Error('Account not found');
            if (!account.nextDeltaToken) throw new Error('Account not ready for sync');
    
            console.log(`Starting email sync for account: ${account.emailAddress}`);
    
            let storedDeltaToken = account.nextDeltaToken;
            let response = await this.getUpdatedEmails({ pageToken: storedDeltaToken });
    
            let allEmails: GmailMessage[] = response.messages;
            while (response.nextPageToken) {
                response = await this.getUpdatedEmails({ pageToken: response.nextPageToken });
                allEmails = allEmails.concat(response.messages);
                if (response.nextPageToken) {
                    storedDeltaToken = response.nextPageToken;
                }
            }
    
            console.log(`Sync completed. Total emails fetched: ${allEmails.length}`);
    
            // Process and save emails to the database
            await syncEmailsToDatabase(allEmails, account.id);
    
            // Update the delta token in the database
            await db.account.update({
                where: { id: account.id },
                data: { nextDeltaToken: storedDeltaToken }
            });
    
            return { emails: allEmails, deltaToken: storedDeltaToken };
        } catch (error) {
            console.error('Error during email sync:', error);
            throw error;
        }
    }

    async sendEmail({
        from,
        subject,
        body,
        inReplyTo,
        references,
        threadId,
        to,
        cc,
        bcc,
        replyTo,
    }: {
        from: EmailAddress;
        subject: string;
        body: string;
        inReplyTo?: string;
        references?: string;
        threadId?: string;
        to: EmailAddress[];
        cc?: EmailAddress[];
        bcc?: EmailAddress[];
        replyTo?: EmailAddress;
    }): Promise<any> {
        try {
            console.log('Preparing to send email...');
            
            // Validate and format email addresses
            const validTo = this.validateEmailAddresses(to);
            const validCc = cc ? this.validateEmailAddresses(cc) : [];
            const validBcc = bcc ? this.validateEmailAddresses(bcc) : [];
    
            // Construct raw email message
            let rawMessage = `From: ${from.name} <${from.address}>\r\n`;
            rawMessage += `To: ${this.formatEmailAddresses(validTo)}\r\n`;
            if (validCc.length > 0) rawMessage += `Cc: ${this.formatEmailAddresses(validCc)}\r\n`;
            if (validBcc.length > 0) rawMessage += `Bcc: ${this.formatEmailAddresses(validBcc)}\r\n`;
            if (replyTo) rawMessage += `Reply-To: ${replyTo.name} <${replyTo.address}>\r\n`;
            if (inReplyTo) rawMessage += `In-Reply-To: ${inReplyTo}\r\n`;
            if (references) rawMessage += `References: ${references}\r\n`;
            rawMessage += `Subject: ${subject}\r\n`;
            rawMessage += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
            rawMessage += `${body}`;

            const encodedMessage = Buffer.from(rawMessage)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            console.log('Sending email via Gmail API...');
            const response = await axios.post(
                'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
                { raw: encodedMessage, threadId },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Email sent successfully:', response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error sending email:', JSON.stringify(error.response?.data, null, 2));
                if (error.response?.status === 401) {
                    console.error('Unauthorized. Token may have expired.');
                    await this.refreshAccessToken();
                    return this.sendEmail({ from, subject, body, inReplyTo, references, threadId, to, cc, bcc, replyTo }); // Retry the request after refreshing the token
                }
            } else {
                console.error('Unexpected error:', error);
            }
            throw error;
        }
    }
}

// Define the EmailAddress type
type EmailAddress = {
    name: string;
    address: string;
};