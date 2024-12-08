'use client'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "~/components/ui/drawer"

import React from "react"
import { Button } from "~/components/ui/button"
import { Pencil } from "lucide-react"
import EmailEditor from "./email-editor"
import { api } from "~/trpc/react"
import useThreads from "~/hooks/use-threads"
import { toast } from "sonner"

const ComposeButton = () => {
    const [open, setOpen] = React.useState(false)
    const [toValues, setToValues] = React.useState<{ label: string, value: string }[]>([]);
    const [subject, setSubject] = React.useState<string>('');
    const sendEmail = api.account.sendEmail.useMutation()
    const { account, threadId } = useThreads()

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'c' && (event.ctrlKey || event.metaKey) && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) {
                event.preventDefault();
                setOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);


    const handleSend = async (value: string) => {
        console.log('Account:', account)
        console.log('Email Body:', value)
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
                console.log('Email sent successfully')
                setOpen(false)
                toast.success("Email sent")
            },
            onError: (error) => {
                setOpen(false)
                console.error('Failed to send email:', error)
                toast.error('Failed to send email')
            }
        })
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button>
                    <Pencil className="size-4 mr-1" />
                    Compose
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Compose Email</DrawerTitle>
                </DrawerHeader>
                <EmailEditor
                    toValues={toValues}
                    setToValues={setToValues}
                    subject={subject}
                    setSubject={setSubject}
                    to={Array.isArray(toValues) ? toValues.map(to => to.value) : []}
                    defaultToolbarExpanded={true}
                    handleSend={handleSend}
                    isSending={sendEmail.isPending}
                />
            </DrawerContent>
        </Drawer>
    )
}

export default ComposeButton;