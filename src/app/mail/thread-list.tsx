'use client'

import React, { type ComponentProps } from "react"
import { cn } from "~/lib/utils"
import useThreads  from "src/hooks/use-threads"
import { format, formatDistanceToNow } from "date-fns"
import { on } from "events"
import DOMPurify from 'dompurify';
import { Badge } from "src/components/ui/badge"



const ThreadList = () => {
    const { threads,threadId ,setThreadId} = useThreads()
    const groupedThreads = threads?.reduce((acc, thread) => {
        const date = format(thread.emails[0]?.sentAt ?? new Date(), "yyyy-MM-dd")
        if (!acc[date]) {
            acc[date] = []
        }
        acc[date].push(thread)
        return acc
    },{} as Record<string, typeof threads>)
    return (
        <div className="max-w-full overflow-y-scroll max-h-[calc(100vh-120px)]">
            <div className="flex flex-col gap-2 p-4 pt-0">
                {Object.entries(groupedThreads ?? {}).map(([date, threads]) => {
                    return <React.Fragment key={date}>
                        <div className="text-xs font-medium text-muted-foreground mt-4 first:mt-0">
                            {date}
                        </div>
                        {threads.map(thread => {
                            const threadFrom = thread.emails.at(-1)?.from.name || "";
                            const displayName = threadFrom.replace(/<.*>/, "").replace(/"/g, "").trim(); // Extract the name outside <>
                            const emailAddress = threadFrom.match(/<([^>]+)>/)?.[1] || ""; // Extract the text inside <>

                            return <button onClick={()=>setThreadId(thread.id)} key={thread.id} className={
                                cn("flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all relative",{
                                    "bg-accent-0": thread.id === threadId,
                                })
                            }>
                                <div className="flex flex-col w-full gap-2">
                                    <div className="flex items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="font-semibold">
                                                {displayName}
                                            </div>
                                        </div>
                                        {/* <div className="text-muted-foreground">{format(thread.emails[0]?.sentAt ?? new Date(), "HH:mm")}</div> */}
                                        <div className={cn("ml-auto text-xs")}>
                                            {formatDistanceToNow(thread.emails.at(-1)?.sentAt ?? new Date(), {addSuffix: true,})}
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium">{thread.subject}</div>
                                </div>
                                <div className="text-xs line-clamp-2 text-muted-foreground" dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(thread.emails.at(-1)?.bodySnippet ?? "", {
                                        USE_PROFILES: { html: true },}),}}>

                                </div>
                                {thread.emails[0]?.sysLabels.length ? (
                                    <div className="flex items-center gap-2">
                                        {thread.emails[0]?.sysLabels
                                            .filter((label) => !label.startsWith("CATEGORY") && label !== "IMPORTANT") // Exclude unwanted labels
                                            .map((label) => (
                                                <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
                                                    {label}
                                                </Badge>
                                            ))}
                                    </div>
                                ) : null}
                            </button>
                        })}
                    </React.Fragment>
                })}
            </div>
        </div>
    )

    function getBadgeVariantFromLabel(label: string): ComponentProps<typeof Badge>["variant"] {
        if (["work"].includes(label.toLowerCase())) {
          return "default";
        }
      
        if (["personal"].includes(label.toLowerCase())) {
          return "outline";
        }
      
        return "secondary";
      }


    
}


export default ThreadList;