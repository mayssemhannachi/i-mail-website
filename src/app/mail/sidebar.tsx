'use client'
import React from 'react'
import { Nav } from 'src/components/nav'

import {
    AlertCircle,
    Archive,
    ArchiveX,
    File,
    Inbox,
    MessagesSquare,
    Send,
    ShoppingCart,
    Trash2,
    Users2,
} from "lucide-react"
import { usePathname } from 'next/navigation'
import { useLocalStorage } from 'usehooks-ts'
import { api } from 'src/trpc/react'
type Props = { isCollapsed: boolean }

const SideBar = ({ isCollapsed }: Props) => {
    const [accountId] = useLocalStorage("accountId", "")
    console.log("Account ID from local storage:", accountId);
    const [tab] = useLocalStorage("I-mAil-tab", "inbox")
    
    const { data: inboxThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: "inbox"
    })

    const { data: draftsThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: "draft"
    })

    const { data: sentThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: "sent"
    })
    
    return (
         <Nav
            isCollapsed={isCollapsed}
            links={[
                {
                    title: "Inbox",
                    label: inboxThreads?.toString() || "0",
                    icon: Inbox,
                    variant: tab === "inbox" ? "default" : "ghost",
                },
                {
                    title: "Draft",
                    label: draftsThreads?.toString() || "0",
                    icon: File,
                    variant: tab === "draft" ? "default" : "ghost",
                },
                {
                    title: "Sent",
                    label: sentThreads?.toString() || "0",
                    icon: Send,
                    variant: tab === "sent" ? "default" : "ghost",
                },
            ]}
            
        />
    )
}

export default SideBar