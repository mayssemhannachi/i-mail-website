// api/aurinko/callback

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getAccountDetails } from 'src/lib/aurinko'; // Ensure these functions are defined in your aurinko.ts
import { db } from 'src/server/db';

export const GET = async (req: NextRequest) => {
    const { userId } = await auth();
    console.log('userId is ', userId);

    // Get the current URL
    const currentUrl = req.url;

    // Extract the authorization code from the URL
    const url = new URL(currentUrl);
    const code = url.searchParams.get('code');
    if (!code) {
        console.error('No code provided');
        return NextResponse.json({ message: 'No code provided' }, { status: 400 });
    }


    try {
        // Exchange the authorization code for a token
        const tokenData = await exchangeCodeForToken(code);
        console.log('Token data received ');

        // Fetch the user's account details using the access token
        const accountDetails = await getAccountDetails(tokenData.access_token);
        console.log('Account details received');

        // Ensure accountDetails contains the necessary fields
        if (!accountDetails.sub) {
            throw new Error('Account details do not contain user ID (sub)');
        }

        // Save the user to your database
        await db.account.upsert({
            where: {
                id: accountDetails.sub.toString(),
            },
            update: {
                accessToken: tokenData.access_token,
            },
            create: {
                id: accountDetails.sub.toString(),
                userId: userId || '',
                emailAdress: accountDetails.email,
                name: accountDetails.name,
                accessToken: tokenData.access_token,
            }
        });

        console.log('User created');
        return NextResponse.redirect(new URL('/mail',req.url))
    } catch (error) {
        console.error('Error processing callback aurinko route', error);
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Failed to process callback', error: errorMessage }, { status: 500 });
    }
};