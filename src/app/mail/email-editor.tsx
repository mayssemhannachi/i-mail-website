"use client";

import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Text } from "@tiptap/extension-text";
import EditorMenuBar from "./editor-menubar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import TagInput from "./tag-input";
import { Input } from "~/components/ui/input";
import AIComposeButton from "./ai-compose-button";
import { generateEmail } from "./action";
import useThreads from "~/hooks/use-threads";
import turndown from "~/lib/turndown";

type Props = {
  subject: string;
  setSubject: (value: string) => void;
  toValues: { label: string; value: string }[];
  setToValues: (value: { label: string; value: string }[]) => void;
  to: string[];
  handleSend: (value: string) => void;
  isSending: boolean;
  defaultToolbarExpanded?: boolean;
};

const EmailEditor = ({
  subject,
  setSubject,
  toValues,
  setToValues,
  to,
  handleSend,
  isSending,
  defaultToolbarExpanded,
}: Props) => {
  const [editorContent, setEditorContent] = React.useState<string>("");
  const editorRef = React.useRef<ReturnType<typeof useEditor> | null>(null); // Reference to hold the editor instance
  const [expanded, setExpanded] = React.useState(defaultToolbarExpanded);

  const { threads, threadId, account } = useThreads();
  const thread = threads?.find((t) => t.id === threadId);

  const CustomText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          console.log("Shortcut triggered: Meta-j");
          aiGenerate(); // Trigger AI content generation
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit, CustomText],
    onCreate: ({ editor }) => {
      console.log("Editor initialized:", editor);
      editorRef.current = editor; // Store the editor instance in the ref
    },
    onUpdate: ({ editor }) => {
      const plainText = editor.getText();
      setEditorContent(plainText); // Update editor content
      editorRef.current = editor; // Ensure the ref is up-to-date
      console.log("Editor content updated:", plainText);
    },
  });

  const aiGenerate = async () => {
    const editorInstance = editorRef.current;
    if (!editorInstance) {
      console.error("AI Generate: Editor instance is not available");
      return;
    }

    const currentContent = editorInstance.getText();
    console.log("Current editor content for AI generation:", currentContent);

    let context = "";
    for (const email of thread?.emails ?? []) {
      const content = `
      Subject: ${email.subject}
      From: ${email.from} 
      Date: ${new Date(email.sentAt).toLocaleString()}
      Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? "")}`;

      context += content;
    }

    context += `
    My name is ${account?.name} and my email is ${account?.emailAddress}.`;

    try {
      console.log("Context for AI generation:", context);
      console.log("Prompt to AI generation:", currentContent);
      const output = await generateEmail(context, currentContent);
      console.log("Generated output from AI:", output);
      onGenerate(output);
    } catch (error) {
      console.error("Error during AI generation:", error);
    }
  };

  const onGenerate = (output: string) => {
    console.log("Inserting generated AI content into editor");
    const editorInstance = editorRef.current;
    if (editorInstance) {
      editorInstance.commands.insertContent(output);
      console.log("AI content inserted successfully");
    } else {
      console.error("Insert Content: Editor instance is not available");
    }
  };

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
            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </>
        )}
        <div className="flex items-center gap-2">
          <div
            className="cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="text-green-600 font-medium">Draft </span>
            <span>
              to{" "}
              {to
                .map((email) => email.match(/<([^>]+)>/)?.[1] || email)
                .join(", ")}
            </span>
          </div>
          <AIComposeButton
            isComposing={defaultToolbarExpanded ?? false}
            onGenerate={onGenerate}
          />
        </div>
      </div>

      <div className="prose w-full px-4">
        <EditorContent editor={editor} />
      </div>
      <Separator />

      <div className="py-3 px-4 flex item-center justify-between">
        <span className="text-sm">
          Tip: Press {""}
          <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            Cmd + J
          </kbd>
          {""}
          for AI autocomplete
        </span>
        <Button
          onClick={async () => {
            editor?.commands.clearContent();
            await handleSend(editorContent);
          }}
          disabled={isSending}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;