import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'openid email profile Mail.Read Mail.Send Mail.ReadWrite Mail.Drafts Mail.All', // Include necessary scopes
                },
            },
        }),
    ],
    pages: {
        error: '/auth/error', // Define a custom error page
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Allow all users to sign in without checking the database
            console.log('User signed in:', user.email);
            return true; // Allow sign in
        },
    },
});