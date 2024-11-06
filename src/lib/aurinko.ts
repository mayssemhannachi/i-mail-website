"use server";

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

export const getAurinkoAuthUrl = async (serviceType: 'Google' | 'Office365') => {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const signingSecret = process.env.AURINKO_SIGNING_SECRET;
    if (!signingSecret) throw new Error('AURINKO_SIGNING_SECRET is not defined');
    const state = jwt.sign({ userId }, signingSecret, { expiresIn: '1h' });
    cookies().set('aurinkoState', state, { path: '/', httpOnly: true, secure: true });

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.compose',
        state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string) => {
    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID as string,
            client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
            grant_type: 'authorization_code',
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error exchanging code:', error.response?.data);
        } else {
            console.error('Unknown error:', error);
        }
        throw error;  // Re-throw to handle this error in the calling function
    }
};

export const getAccountDetails = async (accessToken: string) => {
    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching account details:', error);
        throw error;
    }
};