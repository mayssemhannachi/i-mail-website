"use client"

import React from "react"

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



const ThreadDisplay=() =>{
    const {threadId, threads} =useThreads()
    const thread =threads?.find(t=>t.id===threadId)
    return(
        <div className='flex flex-col h-full'>
            <div className='flex items-center p-2'>
                <div className="flex items-center gap-2">
                    <Button variant={'ghost'} size='icon' disabled={!thread}>
                    <Archive className='siez4' />
                     </Button>
                    <Button variant={'ghost'} size='icon' disabled={!thread}>
                         <ArchiveX className='siez4' />
                    </Button>
                    <Button variant={'ghost'} size='icon' disabled={!thread}>
                         <Trash2 className='siez4' />
                    </Button>
                </div>
                <Separator orientation="vertical" className="ml-2" />
                <Button className="ml-2" variant={'ghost'} size='icon' disabled={!thread}>
                         <Clock className='siez4' />
                </Button>
            
            
                <div className="flex items-center ml-auto">
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
            {thread ? <>
                <div className="flex flex-col flex-1 overflow-scroll">
                    <div className="flex items-center p-4">
                        <div className="flex items-center gap-4 text-sm">
                            <Avatar>
                                <AvatarImage alt="avatar"/>
                                <AvatarFallback>
                                    {thread.emails[0]?.from?.name?.split("").map(chunk=>chunk[0]).join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <div className="font-semibold">
                                    {thread.emails[0]?.from.name}
                                    <div className="text-xs line-clamp-1">
                                        {thread.emails[0]?.subject}
                                    </div>
                                    <div className="text-xs line-clamp-1">
                                        <span className="font-medium">
                                            Reply-To:
                                        </span>
                                        {thread.emails[0]?.from?.address}
                                    </div>
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
                </div>
            </> : <>
                <div className="p-8 text-center text-muted-foreground">
                    No message selected
                </div>
            </>}

           

        </div>
    )
}
 


 



export default ThreadDisplay;  //exporting the component

