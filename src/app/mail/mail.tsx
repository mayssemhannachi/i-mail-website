'use client'
import React, { use } from "react";
import { Tooltip } from "recharts";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup } from 'src/components/ui/resizable';
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TooltipProvider } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import AccountSwitcher  from "src/app/mail/account-switcher"
import SideBar from "./sidebar"
import ThreadList from "./thread-list";

import ThreadDisplay from "./thread-display";
import SearchBar from "./search-bar";


type Props ={
    defaultLayout: number[] | undefined
    navCollapsedSize : number
    defaultCollapsed : boolean
    children?: React.ReactNode;
}
const Mail = ({defaultLayout =[20,32,48] , navCollapsedSize ,defaultCollapsed } : Props) => {

    const [isCollapsed, setisCollapsed ] = React.useState(defaultCollapsed)
    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup direction="horizontal" onLayout={(sizes: number[])=>{
                console.log(sizes)
            }} className="items-stretch h-full min-h-screen">
                <ResizablePanel defaultSize={defaultLayout[0]} collapsedSize={navCollapsedSize} collapsible={true} minSize={15} maxSize={40} onCollapse={()=>{
                    setisCollapsed(true)

                }} onResize={()=>{
                    setisCollapsed(false)
                }} 
                className={cn(isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out')} >
                    <div className="flex flex-col h-full flex-1" >
                        <div className={cn("flex h-[52px] items-center justify-between", isCollapsed ? 'h-[52px]' : 'px-2' )}>
                             {/*account switcher*/}
                             <AccountSwitcher isCollapsed={isCollapsed} />
                              </div>
                            <Separator/>
                            {/*Sidebar*/}
                            <SideBar isCollapsed={isCollapsed} />
                            
                            <div className="flex-1"></div>
                            {/*Ask AI*/}
                            Ask AI
                     </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={defaultLayout[1]}  minSize={30}  >
                    <Tabs defaultValue='inbox'>
                        <div className="flex items-center px-4 py-2">
                            <h1 className="text-xl font-bold">Inbox</h1>
                            <TabsList className="ml-auto">
                                <TabsTrigger value="inbox" className="text-zinc-600 dark:text-zinc-200"> Inbox </TabsTrigger>
                                <TabsTrigger value="done" className="text-zinc-600 dark:text-zinc-200"> Done </TabsTrigger>
                            </TabsList>
                        </div>
                        <Separator />
                        {/*Search Bar*/}
                        <SearchBar />
                        <TabsContent value="inbox"> 
                            <ThreadList />
                        </TabsContent>
                        <TabsContent value="done">
                            <ThreadList />
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
                <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}> 
            <ThreadDisplay/>
        </ResizablePanel>
            </ResizablePanelGroup>

        </TooltipProvider>
    )
}
export default Mail;