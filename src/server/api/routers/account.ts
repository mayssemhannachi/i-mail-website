import {createTRPCRouter, privateProcedure }  from "src/server/api/trpc";
import { z } from "zod";
import { db } from "src/server/db";
import type { Prisma } from "@prisma/client";






export const authoriseAccountAccess = async (accountId: string, userId: string) => {
    const account = await db.account.findFirst({
        where: {
            id: accountId,
            userId: userId,
        },
        select: {
            id: true, emailAddress: true, name: true, token: true
        }
    })
    if (!account) throw new Error("Invalid token")
    return account
}
    
export const accountRouter = createTRPCRouter({
    getAccounts: privateProcedure.query(async ({ ctx})=>{
        return await ctx.db.account.findMany({
            where:{
                userId: ctx.auth.userId},
            select:{
                id: true, emailAddress: true, name: true}

        })
    }),
    getNumThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string()
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        let filter: Prisma.ThreadWhereInput = {}
        if (input.tab === "inbox") {
            filter.inboxStatus=true
        } else if (input.tab === "sent") {
            filter.sentStatus=true
        } else if (input.tab === "draft") {
            filter.draftStatus=true
        }
    
        return await ctx.db.thread.count({
            where:{
                accountId:account.id,
                ...filter
            }
        })
    })
    
})
    