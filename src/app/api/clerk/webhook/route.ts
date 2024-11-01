import { db } from "../../../../server/db";

export const POST = async (req: Request) => {
    const { data } = await req.json();
    console.log('Webhook received:', JSON.stringify(data, null, 2));

    // Extract user details
    const emailAdress = data.email_addresses[0]?.email_address;
    const firstName = data.first_name;
    const lastName = data.last_name; // Check this
    const imageUrl = data.image_url;
    const id = data.id;

    // Log parsed user data
    console.log('Parsed User Data:', { emailAdress, firstName, lastName, imageUrl, id });

    // Check for required fields
    if (!emailAdress || !firstName || !lastName) {
        console.error('Missing required user information:', { emailAdress, firstName, lastName });
        return new Response('Missing required user information', { status: 400 });
    }

    // Attempt to create user
    try {
        await db.user.create({
            data: {
                id: id,
                emailAdress: emailAdress,
                firstName: firstName,
                lastName: lastName,
                imageUrl: imageUrl,
            },
        });

        console.log('User created:', { id, emailAdress });
        return new Response('Webhook received', { status: 200 });
    } catch (error) {
        console.error('Error creating user:', error);
        return new Response('Error creating user', { status: 500 });
    }
};