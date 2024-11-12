// lib/account.ts

import axios from 'axios';
import { GmailMessage } from '~/types';

export class Account {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    // Fetch emails from the last 2 days
    private async startSync() {
        try {
            const response = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params: {
                    maxResults: 10,
                    q: 'newer_than:2d',
                    includeSpamTrash: false
                }
            });

            const messageIds = response.data.messages.map((msg: { id: string }) => msg.id);

            // Fetch details of each message
            const messages = await Promise.all(messageIds.map(async (id: string) => {
                const messageResponse = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
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
    async getUpdatedEmails({ pageToken }: { pageToken?: string }) {
        try {
            const params: Record<string, string> = {
                maxResults: '10',
                q: 'newer_than:2d',  // Fetch emails from last 2 days
                includeSpamTrash: 'true'
            };

            if (pageToken) params.pageToken = pageToken;

            const response = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params,
            });

            const messageIds = response.data.messages.map((msg: { id: string }) => msg.id);

            // Fetch details of each message
            const messages = await Promise.all(messageIds.map(async (id: string) => {
                const messageResponse = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    }
                });
                return messageResponse.data;
            }));

            return { messages, nextPageToken: response.data.nextPageToken };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                console.error('Unauthorized request. Token may have expired.', error);
                // Handle token refresh logic here if necessary
            } else {
                console.error('Error during getUpdatedEmails in Account.ts', error);
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

            if (!syncResponse || !syncResponse.nextPageToken) {
                throw new Error('No nextPageToken found');
            }

            // Save the delta token (nextPageToken) for future syncs
            let storedDeltaToken = syncResponse.nextPageToken;

            // Retrieve all emails, handling pagination if required
            let allEmails: GmailMessage[] = syncResponse.messages;
            let updatedResponse = await this.getUpdatedEmails({ pageToken: storedDeltaToken });

            while (updatedResponse.nextPageToken) {
                updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken });
                allEmails = allEmails.concat(updatedResponse.messages);

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
}