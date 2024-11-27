"use client"
import React from "react"
import EmailDisplay  from "./email-display"
import EmailEditor from "./email-editor"
import { EditorContent, useEditor } from "@tiptap/react";
import {api, RouterOutputs} from '~/trpc/react'
import useThreads from "~/hooks/use-threads";
import { Value } from "@radix-ui/react-select";


const ReplyBox = () => {
    const {threadId,accountId} = useThreads()
    const {data:replyDetails} = api.account.getReplyDetails.useQuery({
        threadId:threadId ?? "",
        accountId
    })

    if (!replyDetails) return null

    return <Component replyDetails={replyDetails} />
}

const Component = ({replyDetails}:{replyDetails:RouterOutputs['account']['getReplyDetails']}) => {
    const {threadId,accountId} = useThreads()
    const [subject, setSubject] = React.useState(replyDetails.subject.startsWith('Re:') ? replyDetails.subject : `Re: ${replyDetails.subject}`);
    const [toValues, setToValues] = React.useState<{ label: string, value: string }[]>(replyDetails.to.map(to => ({ label: to.address ?? to.name, value: to.address })) || [])

    React.useEffect(() => {
        if (!replyDetails || !threadId) return;

        if (!replyDetails.subject.startsWith('Re:')) {
            setSubject(`Re: ${replyDetails.subject}`)
        }
        setToValues(replyDetails.to.map(to => ({ label: to.address ?? to.name, value: to.address })))

    }, [replyDetails, threadId])

    const handleSend = async(value:string) =>{
        console.log(value)
    }

    return(
        <EmailEditor
            subject={subject}
            setSubject={setSubject}

            toValues={toValues}
            setToValues={setToValues}

            to={replyDetails.to.map(to => to.address)}
            handleSend={handleSend}
            isSending={false}
        />
    )
}







export default ReplyBox;  //export default ReplyBox; 