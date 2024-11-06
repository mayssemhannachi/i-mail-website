// /api/clerk/webhook

import { db } from "../../../../server/db";

console.log('Clerk webhook route');

export const POST = async (req: Request) => {
    try {
        const json = await req.json();
        console.log('Clerk webhook received');

        const data = json.data || json; // Adjust this based on the actual structure of the incoming data
        console.log('Parsed data:', JSON.stringify(data, null, 2));

        const emailAddress = data.email_addresses?.[0]?.email_address;
        const firstName = data.first_name;
        const lastName = data.last_name;
        const imageUrl = data.image_url;
        const id = data.id;

        if (!emailAddress || !id) {
            console.error('Missing required fields', { emailAddress, id });
            return new Response('Missing required fields', { status: 400 });
        }

        // Check if the user already exists
        const existingUser = await db.user.findUnique({
            where: { id: id },
        });

        if (existingUser) {
            console.log('User already exists', existingUser);
        }

        // Save the user to your database
        await db.user.create({
            data: {
                id: id,
                emailAdress: emailAddress,
                firstName: firstName,
                lastName: lastName,
                imageUrl: imageUrl,
            },
        });

        console.log('User created');
    } catch (error) {
        console.error('Error processing webhook', error);
        if (error instanceof Error) {
            return new Response(`Internal server error clerk route: ${error.message}`, { status: 500 });
        }
        return new Response('Internal server error clerk route', { status: 500 });
    }
};