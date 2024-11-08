import axios from 'axios';
import { EmailMessage, SyncResponse, SyncUpdatedResponse } from '~/types';

export class Account {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async startSync() {
        try {
            const response = await axios.get('https://www.googleapis.com/gmail/v1/users/me/messages', {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params: {
                    q: 'newer_than:2d',
                    format: 'full'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error during startSync accounts.ts startSync', error);
            throw error;
        }
    }

        async getUpdatedEmails({ deltaToken, pageToken }: { deltaToken?: string, pageToken?: string }) {
        try {
            let params: Record<string, string> = {};
            if (deltaToken) params.q = `newer_than:2d`;
            if (pageToken) params.pageToken = pageToken;
    
            const response = await axios.get('https://www.googleapis.com/gmail/v1/users/me/messages', {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params,
            });
    
            return response.data;
        } catch (error) {
            if ((error as any).response && (error as any).response.status === 401) {
                console.error('Unauthorized request. Token may have expired.', error);
                // Handle token refresh logic here
            } else {
                console.error('Error during getUpdatedEmails', error);
            }
            throw error;
        }
    }

        async performInitialSync() {
        try {
            // Start sync process
            let syncResponse = await this.startSync();
    
            // Get the bookmark delta token
            let storedDeltaToken: string = syncResponse.nextPageToken;
    
            // Get all the emails
            let updatedResponse = await this.getUpdatedEmails({ deltaToken: storedDeltaToken });
    
            if (updatedResponse.nextPageToken) {
                // Sync has completed
                // Save the delta token
                storedDeltaToken = updatedResponse.nextPageToken;
            }
            let allEmails: EmailMessage[] = updatedResponse.messages;
    
            // Fetch all pages if there are more
            while (updatedResponse.nextPageToken) {
                updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken });
                allEmails = allEmails.concat(updatedResponse.messages);
    
                if (updatedResponse.nextPageToken) {
                    // Sync has completed
                    // Save the delta token
                    storedDeltaToken = updatedResponse.nextPageToken;
                }
            }
    
            console.log('Initial sync completed, we have synced', allEmails.length, 'emails');
    
            // Store the latest delta token for future incremental syncs
    
            return {
                emails: allEmails,
                deltaToken: storedDeltaToken
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error during pSync', JSON.stringify(error.response?.data, null, 2));
            } else {
                console.error('Error during pSync', error);
            }
        }
    }
}