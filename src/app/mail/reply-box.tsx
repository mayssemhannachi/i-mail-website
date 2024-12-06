"use client"
import React from "react"
import EmailEditor from "./email-editor"
import {api, type RouterOutputs} from '~/trpc/react'
import useThreads from "~/hooks/use-threads";
import { toast } from "sonner";


const ReplyBox = () => {
    const {threadId,accountId} = useThreads()
    const {data:replyDetails} = api.account.getReplyDetails.useQuery({
        threadId:threadId ?? "",
        accountId
    })

    if (!replyDetails) return <></>

    return <Component replyDetails={replyDetails} />
}

const Component = ({replyDetails}:{replyDetails:RouterOutputs['account']['getReplyDetails']}) => {
    const [toValues, setToValues] = React.useState<{ label: string, value: string }[]>([]);
    const [subject, setSubject] = React.useState<string>('');
    const sendEmail = api.account.sendEmail.useMutation()
    const { account ,threadId} = useThreads()
    React.useEffect(() => {
        if (!replyDetails || !threadId) return;

        if (!replyDetails.subject.startsWith('Re:')) {
            setSubject(`Re: ${replyDetails.subject}`)
        }
        setToValues(replyDetails.to.map(to => ({ label: to.address ?? to.name, value: to.address })))

    }, [replyDetails, threadId])

    const handleSend = async(value:string) =>{
        console.log(account)
        console.log({ value })
        if (!account) return
        sendEmail.mutate({
            accountId: account.id,
            email: {
                threadId: threadId ?? undefined,
                body: value,
                from: { name: account?.name ?? "Me", address: account.emailAddress ?? "me@example.com" },
                to: Array.isArray(toValues) ? toValues.map(to => ({ address: to.value, name: "" })) : [],
                subject: subject,
                inReplyTo: undefined,
                replyTo: { name: account?.name ?? "Me", address: account.emailAddress ?? "me@example.com" }
            },
        }, {
            onSuccess: () => {
                toast.success('Email Sent')
            },
            onError: (error) => {
                console.error(error)
                toast.error('Failed to send email')
            }
        })
    }

    return(
        <EmailEditor
            subject={subject}
            setSubject={setSubject}
            
            toValues={toValues}
            setToValues={setToValues}

            to={replyDetails.to.map(to => to.address)}
            handleSend={handleSend}
            isSending={sendEmail.isPending}
        />
    )
}







export default ReplyBox;  //export default ReplyBox; 