// /api/initial-sync

import { db } from 'src/server/db';
import { NextRequest, NextResponse } from 'next/server';
import { Account } from 'src/lib/account';

export const POST = async (req: NextRequest) => {
    try {
        const { accountId, userId } = await req.json();
        console.log('Initial sync request received', { accountId, userId });

        if (!accountId || !userId) {
            console.error('Missing accountId or userId');
            return NextResponse.json({ error: 'Missing accountId or userId' }, { status: 400 });
        }

        const dbAccount = await db.account.findUnique({
            where: {
                id: accountId,
                userId
            }
        });

        if (!dbAccount) {
            console.error('Account not found');
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Perform initial sync
        const account = new Account(dbAccount.accessToken);

        const response = await account.performInitialSync();
        if (!response) {
            console.error('Error during initial sync perform function');
            return NextResponse.json({ error: 'Error during initial sync perform function' }, { status: 500 });
        }

        // Sync emails to database
        const { emails, deltaToken } = response;
        console.log('emails', emails);

        // Update the account with the next delta token
       // await db.account.update({
        //    where: {
         //       id: accountId
          //  },
         //   data: {
           //     nextDeltaToken: deltaToken
         //   }
      //  });

        // Sync emails to database (implement this function as needed)
        // await syncEmailsToDatabase(emails);

        console.log('Sync completed', deltaToken);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error processing initial sync request', error);
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Failed to process initial sync request', error: errorMessage }, { status: 500 });
    }
};