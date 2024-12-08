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

    const handleSend = async(value:string) =>{
        console.log('value',value)
    }
    
    return(
        <Drawer>
        <DrawerTrigger>
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
            isSending={false}
            />
        </DrawerContent>
        </Drawer>
    )
}
export default ComposeButton;