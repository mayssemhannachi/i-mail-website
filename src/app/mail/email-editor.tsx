"use client"
import React from "react"
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from '@tiptap/starter-kit';
import {Text} from "@tiptap/extension-text";
import EditorMenuBar from "./editor-menubar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import TagInput from "./tag-input";
import { Input } from "~/components/ui/input";


type Props ={
    subject : string,
    setSubject : (value:string) => void

    toValues: { label: string, value: string }[]
    setToValues : (value :{label:string, value: string }[]) => void


    to: string[]

    handleSend: (value: string) => void;
    isSending: boolean;

    defaultToolbarExpanded?: boolean;
}

const EmailEditor = ({subject,setSubject,toValues,setToValues,to,handleSend,isSending,defaultToolbarExpanded}: Props) => {
    const [value,setValue] = React.useState<string>("")
    const [expanded, setExpanded] = React.useState(defaultToolbarExpanded);
    const CustomText= Text.extend({
        addKeyboardShortcuts(){
            return {
                "Meta-j": () => {
                    console.log("Meta-j")
                    return true 
                }
            }
        }
    })
    const editor= useEditor({
        autofocus:false,
        extensions: [StarterKit,CustomText],
        onUpdate:({editor}) =>setValue(editor.getHTML())

    })
    if (!editor) return null;
    return (
        <div>
            <div className="flex p-4 py-2 border-b">
                {<EditorMenuBar editor={editor} />}
            </div>

            <div className="p-4 pb-0 space-y-2">
                {expanded && (
                    <>
                       <TagInput
                            label="To"
                            onChange={setToValues}
                            placeholder="Add recipients"
                            value={toValues}
                        />
                        

                        <Input id='subject' placeholder='Subject' value={subject} onChange={e => setSubject(e.target.value)} />
                       
                    </>
                )}
                <div className="flex items-center gap-2  ">
                    <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
                        <span className="text-green-600 font-medium">
                            Draft{" "}
                        </span>
                        <span>
                             to {to.join(',')}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="prose w-full px-4">
                <EditorContent editor={editor} value={value} />

            </div>
            <Separator/>

            <div className="py-3 px-4 flex item-center justify-between ">
                <span className="text-sm">
                    Tip: Press {""}
                    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                        Cmd + J
                    </kbd>{""}
                    For IA autocomplete 
                </span>
                <Button onClick={async () => { editor?.commands.clearContent(); await handleSend(value) }} disabled={isSending}>
                send
                </Button>
            </div>
        </div>
        );
};

export default EmailEditor;  // Export the component