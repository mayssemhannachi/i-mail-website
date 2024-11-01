// /api/clerk/webhook

import { db } from "../../../../server/db";

export const POST = async (req : Request) => {
    const {data} = await req.json()
    console.log('clerk wehbook received', data)
    const emailAdress = data.email_addresses[0].email_address
    const firstName = data.first_name
    const lastName = data.last_name
    const imageUrl = data.image_url
    const id = data.id

    // Save the user to your database
    await db.user.create({
        data:{
            id : id,
            emailAdress : emailAdress,
            firstName : firstName,
            lastName : lastName,
            imageUrl : imageUrl
        }
    })

    console.log('user created')
    
    return new Response('wehbook received', {status:200})
}
