import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "~/trpc/react";
import { atom, useAtom } from 'jotai';
import { useQueries } from "@tanstack/react-query";

export const threadIdAtom = atom<string | null>(null);

const useThreads = () => {
    const{data:accounts}=api.account.getAccounts.useQuery();
    const[accountId]=useLocalStorage("accountId","");
    const[tab]=useLocalStorage("I-mAil-tab","inbox");
    const[done]=useLocalStorage("I-mAil-done",false);
    const [threadId,setThreadId]=useAtom(threadIdAtom);

    const {data:threads,isFetching,refetch}=api.account.getThreads.useQuery({
        accountId,
        tab,
        done
    },{
        enabled: !!accountId && !!tab,placeholderData:e =>e,refetchInterval:5000
    })

    return {
        threads,
        isFetching,
        refetch,
        accountId,
        threadId,setThreadId,
        account:accounts?.find(e=>e.id===accountId),
    }
}

export default useThreads;