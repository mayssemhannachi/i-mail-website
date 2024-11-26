"use client"

import React from "react"
import EmailDisplay from "./email-display"

import useThreads from "~/hooks/use-threads"
import { Button } from "src/components/ui/button"
import {
    Archive,
    ArchiveX,
    Clock,
    Forward,
    MoreVertical,
    Reply,
    ReplyAll,
    Trash2,
  } from "lucide-react"

  import {
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
  } from "src/components/ui/dropdown-menu"
  import {
    DropdownMenu,
    DropdownMenuTrigger,
  } from "src/components/ui/dropdown-menu"
import { Avatar } from "@radix-ui/react-avatar"
import { AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { format } from "date-fns"
import { date } from "zod"
import { Separator } from "src/components/ui/separator"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "~/components/ui/tooltip"



export function ThreadDisplay() {
    const {threadId, threads} =useThreads()
    const thread =threads?.find(t=>t.id===threadId)
    const threadFrom = thread ? thread.emails.at(-1)?.from.name || "" : "";
    const displayName = threadFrom.replace(/<.*>/, "").trim(); // Extract the name outside <>
    const emailAddress = threadFrom.match(/<([^>]+)>/)?.[1] || ""; // Extract the text inside <>

    return(
        <div className='flex flex-col h-full'>
            <div className='flex items-center p-2'>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={'ghost'} size='icon' disabled={!thread}>
                                <Archive className='w-4 h-4' />
                                <span className='sr-only'>Archive</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Archive</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={'ghost'} size='icon' disabled={!thread}>
                                <Trash2 className='w-4 h-4' />
                                <span className='sr-only'>Move to junk</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move to junk</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={'ghost'} size='icon' disabled={!thread}>
                                <Reply className='w-4 h-4' />
                                <span className='sr-only'>Reply</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reply</TooltipContent>
                    </Tooltip>
                    
                </div>
            
            
                <div className="flex items-center gap-2 ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger >
                            <Button className="ml-2" variant="ghost" size="icon" disabled={!thread}>
                                <MoreVertical className="size-4" />
                                
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Mark as unread</DropdownMenuLabel>
                                <DropdownMenuLabel>Star thread</DropdownMenuLabel>
                                <DropdownMenuLabel>Add label</DropdownMenuLabel>
                                <DropdownMenuLabel>Mute thread</DropdownMenuLabel>
                            </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <Separator />
            {thread ? (
                <div className="flex flex-col flex-1 overflow-scroll">
                    <div className="flex items-start p-4">
                        <div className="flex items-start gap-4 text-sm">
                            <Avatar>
                                <AvatarImage alt="avatar"/>
                                <AvatarFallback >
                                    {displayName.split(" ").map(word => word[0]).join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <div className="font-semibold">
                                    {displayName}
                                </div>
                                <div className="text-xs line-clamp-1">
                                    {thread.emails[0]?.subject}
                                </div>
                                <div className="text-xs line-clamp-1">
                                    <span className="font-medium">
                                        Reply-To:
                                    </span>
                                    {emailAddress}
                                </div>
                            </div>
                        </div>
                        {thread.emails[0]?.sentAt && (
                            <div className="ml-auto text-xs text-muted-foreground">
                                {format(new Date(thread.emails[0]?.sentAt),"PPpp")}
                            </div>
                        )}
                    </div>
                    <Separator/>
                    <div className="max-h-[calc(100vh-50px)] overflow-scroll flex flex-col">
                        <div className="p-6 flex-col gap-4">
                            {thread.emails.map(email =>{
                                return <EmailDisplay key={email.id} email={email}/>
                            })}
                        </div>
                    </div>
                    <div className="flex-1"></div>
                    <Separator className="mt-auto"/>
                    Reply box
                </div>
            ) :(
            <>
                <div className="p-8 text-center text-muted-foreground">
                    No message selected
                </div>
            </>
            )}

           

        </div>
    )
}
 


 



export default ThreadDisplay;  //exporting the component

