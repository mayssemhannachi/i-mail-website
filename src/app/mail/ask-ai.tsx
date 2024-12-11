'use client'
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "~/lib/utils";
import { Send, SparklesIcon } from "lucide-react";
import { useChat } from 'ai/react';
import useThreads from "~/hooks/use-threads";

const AskAI = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const { accountId } = useThreads();
    const { input, handleInputChange, messages, setMessages, setInput } = useChat({
        api: '/api/chat',
        body: {
            accountId
        },
        onError: error => {
            console.log('error askai', error);
        },
        initialMessages: []
    });

    const handleSubmitWithAIResponse = async (event: React.FormEvent) => {
        event.preventDefault();
        const userMessage = { id: Date.now().toString(), role: 'user' as 'user', content: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accountId, messages: [...messages, userMessage] })
            });

            const data = await response.json();
            const aiMessage = {
                id: Date.now().toString(),
                role: 'assistant' as 'assistant',
                content: data.content // Ensure this is the correct way to access the response text
            };
            setMessages(prevMessages => [...prevMessages, aiMessage]);
            setInput(''); // Clear the input field
        } catch (error) {
            console.log('error askai', error);
        }
    };

    if (isCollapsed) return null;

    return (
        <div className="p-4 mb-14">
            <motion.div className="flex flex-1 flex-col items-end pb-4 p-4 rounded-lg bg-gray-100 shadow-inner dark:bg-gray-900">
                <div className="max-h-[50vh] overflow-y-scroll w-full flex flex-col gap-2" id="message-container">
                    <AnimatePresence mode="wait">
                        {messages.map(message => (
                            <motion.div key={message.id} layout='position' className={cn('z-10 mt-2 max-w-[250px] break-words rounded-lg bg-gray-200 dark:bg-gray-800', {
                                'self-end text-gray-900 dark:text-gray-100': message.role === 'user',
                                'self-start bg-blue-500 text-white': message.role === 'assistant'
                            })}
                                layoutId={`container-[${message.id}]`}
                                transition={{
                                    type: 'easeOut',
                                    duration: 0.2
                                }}
                            >
                                <div className="px-3 py-2 text-[15px] leading-[15px]">
                                    {message.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                {messages.length > 0 && (<div className="h-4" />)}
                <div className="w-full">
                    {messages.length === 0 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-4">
                                <SparklesIcon className="size-6 text-gray-600" />
                                <div>
                                    <p className="text-gray-900 dark:text-gray-100">Ask AI anything about your emails</p>
                                    <p className="text-gray-500 text-xs dark:text-gray-400">Get answers to your questions about your emails</p>
                                </div>
                            </div>
                            <div className="h-2"></div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-xs" onClick={() => {
                                    handleInputChange({
                                        target: { value: 'What can I ask?' }
                                    });
                                }}>
                                    What can I ask?
                                </span>
                                <span className="px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-xs" onClick={() => {
                                    handleInputChange({
                                        target: { value: 'When is my next flight?' }
                                    });
                                }}>
                                    When is my next flight?
                                </span>
                                <span className="px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-xs" onClick={() => {
                                    handleInputChange({
                                        target: { value: 'When is my next meeting?' }
                                    });
                                }}>
                                    When is my next meeting?
                                </span>
                            </div>
                        </div>)}
                    <form className="w-full flex" onSubmit={handleSubmitWithAIResponse}>
                        <input type='text'
                            className="py-1 relative h-9 placeholder:text-[13px] flex-grow rounded-full border border-gray-200 bg-white px-3 text-[15px] outline-none"
                            placeholder="Ask AI anything about your emails"
                            value={input}
                            onChange={handleInputChange} />
                            <motion.div key={messages.length}
                            className="pointer-events-none absolute z-10 flex h-9 w-[250px] items-center overflow-hidden break-words rounded-full bg-gray-400 [word-break:break-word] dark:bg-gray_800"
                            layout='position'
                            layoutId={`container-[${messages.length}]`}
                            transition={{
                                type: 'easeOut',
                                duration: 0.2,
                            }}
                            initial={{ opacity: 0.6, zIndex: -1 }}
                            animate={{ opacity: 0.6, zIndex: -1 }}
                            exit={{ opacity: 1, zIndex: 1 }}
                        >
                            <div className="px-3 py-2 text-[15px] leading-[15px] text-gray-900 dark:text-gray-100">
                                {input}
                            </div>
                        </motion.div>
                        <button type="submit" className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-200
            dark:bg-gray-800">
                            <Send className="size-4 text-gray-500 dark:text-gray-300" />
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default AskAI;