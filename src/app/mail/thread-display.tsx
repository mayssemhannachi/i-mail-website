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
  import { Separator } from "@radix-ui/react-separator";

  import {
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
  } from "src/components/ui/dropdown-menu"
  import {
    DropdownMenu,
    DropdownMenuTrigger,
  } from "src/components/ui/dropdown-menu"


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

           

        </div>
    )
}
 


 



export default ThreadDisplay;  //exporting the component

