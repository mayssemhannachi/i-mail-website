"use client "
import { EmailAddress } from "@clerk/nextjs/server"
import React from "react"
import useThreads from "~/hooks/use-threads"
import { cn } from "~/lib/utils"
import { RouterOutputs } from "~/trpc/react"
import { Letter } from 'react-letter';
import Avatar from 'react-avatar';
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"

type Props = {
    email: RouterOutputs['account']['getThreads'][0]['emails'][0];
};

const EmailDisplay = ({ email }: Props) => {
    const { account } = useThreads()
    const letterRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (letterRef.current) {
            const gmailQuote = letterRef.current.querySelector('div[class*="_gmail_quote"]');
            if (gmailQuote) {
                gmailQuote.innerHTML = '';
            }
        }
    }, [email]);
    const isMe = account?.emailAddress === email.from.address;
    const displayName = email.from.name?.replace(/<.*>/, "").replace(/"/g, "").trim();    // who sent the email?
    const emailAddress = email.from.name?.match(/<([^>]+)>/)?.[1] || ""; 
    return (
        <div className={
            cn("border rounded-md p-4 cursor-pointer transition-all  hover:translate-x-2",{
                "border-l-gray-900 border-l-4":isMe
            })} ref={letterRef}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                {!isMe && <Avatar name={displayName ?? emailAddress} email={emailAddress} size='35' textSizeRatio={2} round={true} />}
                    <span className='font-medium'>
                        {isMe ? 'Me' : emailAddress}
                    </span>
                </div>
                <p className='text-xs text-muted-foreground'>
                    {formatDistanceToNow(email.sentAt ?? new Date(), {
                        addSuffix: true,
                    })}
                </p>
                
            </div>
            <div className="h-4"></div>
            <Letter className='bg-white rounded-md text-black' html={email?.body ?? ""} />
        </div>
    );
};

export default EmailDisplay;
