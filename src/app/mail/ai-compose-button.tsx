'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "~//components/ui/dialog"
  
import React from "react"
import { Button } from "~/components/ui/button"
import { Bot } from "lucide-react"
import { set } from "date-fns"
import { generateEmail } from "./action"
import useThreads from "~/hooks/use-threads"
import turndown from "~/lib/turndown"


type Props ={
    isComposing: boolean,
    onGenerate: (token:string) => void
}

const AIComposeButton = (props: Props) => {
    const [open,setOpen] = React.useState(false)
    const [prompt,setPropmt] = React.useState("")
    const {threads,threadId,account} = useThreads() 
    const thread = threads?.find(t => t.id === threadId)

    const aiGenerate = async () => {
        let context = ""

        if(!props.isComposing){
            for (const email of thread?.emails ?? []){
                const content = `
                Subject: ${email.subject}
                From: ${email.from} 
                Date: ${new Date(email.sentAt).toLocaleString()}
                Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? '')}`

                context += content
            }
        }
        context+=`
        My name is ${account?.name} and my email is ${account?.emailAddress}.`
        console.log(context)
        const output = await generateEmail(context,prompt)
        props.onGenerate(output)
        console.log(output)
    }

    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button size='icon' variant='outline' onClick={() => setOpen(true)}>
                    <Bot className="size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>AI Smart Compose</DialogTitle>
                <DialogDescription>
                AI will help you compose your email.
                </DialogDescription>
                <div className="h-2"></div>
                <textarea value={prompt} onChange={(e) => setPropmt(e.target.value)} placeholder="Enter a prompt."/>
                <div className="h-2"></div>
                <Button onClick={()=>{
                    aiGenerate()
                    setOpen(false)
                    setPropmt("")
                }}>
                    Generate
                </Button>
            </DialogHeader>
            </DialogContent>
        </Dialog>
        
    )
}

export default AIComposeButton