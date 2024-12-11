'use client'
import React, { useState } from 'react'
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
    BarChart,
    Bot,
} from "lucide-react"
import { useLocalStorage } from 'usehooks-ts'
import { api } from 'src/trpc/react'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '~/components/ui/dialog'
import { Button, buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'
<<<<<<< HEAD
import { BarChartComponent } from './dashboard'
=======
import { BarChartComponent } from 'src/app/dashboard/dashboard'
>>>>>>> 45a6592b8d8f09a13cf5435c367687e390a5ce29



type Props = { isCollapsed: boolean }

const SideBar = ({ isCollapsed }: Props) => {
    const [accountId] = useLocalStorage("accountId", "")
    const [tab, setTab] = useLocalStorage("I-mAil-tab", "inbox")
    const [open, setOpen] = useState(false)
    const [prompt, setPrompt] = useState("")

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

    const aiGenerate = () => {
        // Your AI generation logic here
        console.log("AI Generate:", prompt)
    }

    return (
        <>
            <Nav
                isCollapsed={isCollapsed}
                links={[
                    {
                        title: "Inbox",
                        label: inboxThreads?.toString() || "0",
                        icon: Inbox,
                        variant: tab === "inbox" ? "default" : "ghost",
                        onClick: () => setTab("inbox")
                    },
                    {
                        title: "Draft",
                        label: draftsThreads?.toString() || "0",
                        icon: File,
                        variant: tab === "draft" ? "default" : "ghost",
                        onClick: () => setTab("draft")
                    },
                    {
                        title: "Sent",
                        label: sentThreads?.toString() || "0",
                        icon: Send,
                        variant: tab === "sent" ? "default" : "ghost",
                        onClick: () => setTab("sent")
                    },
                    
                ]}
            />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <span
                        className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "justify-start cursor-pointer"
                        )}
                        onClick={() => setOpen(true)}
                    >
                        <BarChart className="w-4 h-4 mr-2" />
                        KPIs
                    </span>
                </DialogTrigger>
<<<<<<< HEAD
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>AI Smart Compose</DialogTitle>
                        <DialogDescription>
                            AI will help you compose your email.
                        </DialogDescription>
                        {BarChartComponent()}
                    </DialogHeader>
                </DialogContent>
            </Dialog>
=======
                <DialogContent className="w-full sm:w-[90vw] md:w-[70vw] lg:w-[50vw]">
                    <DialogHeader>
                        <DialogTitle>Chatbot Usage Over the Week</DialogTitle>
                    </DialogHeader>
                    {/* Ajustement du graphique pour être responsive */}
                    <div className="w-full h-[400px]">
                        {BarChartComponent()}
                    </div>
                </DialogContent>
            </Dialog>


>>>>>>> 45a6592b8d8f09a13cf5435c367687e390a5ce29
        </>
    )
}

export default SideBar

