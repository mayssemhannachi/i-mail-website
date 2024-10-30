// /api/clerk/webhook

export const POST = async (req : Request) => {
    const {data} = await req.json()
    console.log('clerk wehbook received', data)
    
    return new Response('wehbook received', {status:200})
}
