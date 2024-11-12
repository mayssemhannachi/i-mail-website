// /api/initial-sync

import { db } from 'src/server/db';
import { NextRequest, NextResponse } from 'next/server';
import { Account } from 'src/lib/account';
import { syncEmailsToDatabase } from 'src/lib/sync-to-db';

export const POST = async (req: NextRequest) => {
    try {
        const { accountId, userId } = await req.json();
        console.log('Initial sync request received', { accountId, userId });

        if (!accountId || !userId) {
            console.error('Missing accountId or userId');
            return NextResponse.json({ error: 'Missing accountId or userId' }, { status: 400 });
        }

        const dbAccount = await db.account.findUnique({
            where: { id: accountId, userId }
        });

        if (!dbAccount) {
            console.error('Account not found');
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        const account = new Account(dbAccount.token);

        const response = await account.performInitialSync();
        console.log('Initial sync response: got all emails'); // Log the full response here

        if (!response) {
            console.error('Error during initial sync perform function');
            return NextResponse.json({ error: 'Error during initial sync perform function' }, { status: 500 });
        }

        const { emails, deltaToken } = response;

        try {
            await db.account.update({
                where: { id: accountId },
                data: { nextDeltaToken: deltaToken }
            });
        } catch (dbError) {
            console.error('Error updating account with new deltaToken:', dbError);
            return NextResponse.json({ error: 'Failed to update deltaToken in database' }, { status: 500 });
        }

        try {
            await syncEmailsToDatabase(emails, accountId);
        } catch (syncError) {
            console.error('Error syncing emails to database:', syncError);
            return NextResponse.json({ error: 'Failed to sync emails to database' }, { status: 500 });
        }

        console.log('Sync completed successfully', deltaToken);

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Error processing initial sync request', error);
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Failed to process initial sync request', error: errorMessage }, { status: 500 });
    }
};