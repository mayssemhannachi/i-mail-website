// src/server/api/routers/account.ts

import { createTRPCRouter, privateProcedure } from "src/server/api/trpc";
import { z } from "zod";
import { db } from "src/server/db";
import type { Prisma } from "@prisma/client";
import { emailAddressSchema } from "src/types";
import { Account } from "~/lib/account";
import { create, insert, search, save, load, type AnyOrama } from "@orama/orama";
import { persist, restore } from "@orama/plugin-data-persistence";


export class OramaClient {
    //@ts-ignore
    private orama : AnyOrama 
    private accountId:string;
    constructor(accountId:string){
        this.accountId = accountId
    }
    async saveIndex() {
        const index = await persist(this.orama, 'json');
        console.log('Index saved:', index);
        await db.account.update({
            where: { id: this.accountId },
            data: { binaryIndex: index }
        });
    }
    async initialize(){
        const account = await db.account.findUnique({
            where:{id:this.accountId},
            
        })
        console.log('Account retrieved:', account);
        if (!account) {throw new Error('Account not found')};
        if (account.binaryIndex) {
            this.orama = await restore('json', account.binaryIndex as any);
        }else{
            this.orama=await create({
                schema:{
                    subject:'string',
                    body:'string',
                    rawBody: "string",
                    from: 'string',
                    to: 'string[]',
                    sentAt: 'string',
                    embeddings: 'vector[768]',
                    threadId: 'string'
                }
            });
            await this.saveIndex();
            console.log('Current Schema:', this.orama.schema);
        }
    }
    
    async search({ term }: { term: string }) {
        return await search(this.orama, {
            term
        });
    }
    async insert(document: any) {
        console.log('Orama instance:', this.orama);
        console.log('Document:', document);
    
        if (typeof document.to === 'string') {
            document.to = [document.to];
        }
    
        await insert(this.orama, document);
        await this.saveIndex();
    }
    
}

export const authoriseAccountAccess = async (accountId: string, userId: string) => {
    const account = await db.account.findFirst({
        where: {
            id: accountId,
            userId: userId,
        },
        select: {
            id: true, emailAddress: true, name: true, token: true
        }
    });
    if (!account) throw new Error("Invalid token");
    return account;
};

export const accountRouter = createTRPCRouter({
    getAccounts: privateProcedure.query(async ({ ctx }) => {
        return await ctx.db.account.findMany({
            where: {
                userId: ctx.auth.userId
            },
            select: {
                id: true, emailAddress: true, name: true
            }
        });
    }),
    getNumThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string()
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
        let filter: Prisma.ThreadWhereInput = {};
        if (input.tab === "inbox") {
            filter.inboxStatus = true;
        } else if (input.tab === "sent") {
            filter.sentStatus = true;
        } else if (input.tab === "draft") {
            filter.draftStatus = true;
        }

        return await ctx.db.thread.count({
            where: {
                accountId: account.id,
                ...filter
            }
        });
    }),
    getThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean()
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);

        let filter: Prisma.ThreadWhereInput = {
            accountId: input.accountId, // Ensure threads belong to the account
        };
        if (input.tab === "inbox") {
            filter.inboxStatus = true;
        } else if (input.tab === "sent") {
            filter.sentStatus = true;
        } else if (input.tab === "draft") {
            filter.draftStatus = true;
        }

        filter.done = {
            equals: input.done
        };

        return await ctx.db.thread.findMany({
            where: filter,
            include: {
                emails: {
                    orderBy: {
                        sentAt: "asc"
                    },
                    select: {
                        from: true,
                        body: true,
                        bodySnippet: true,
                        emailLabel: true,
                        subject: true,
                        sysLabels: true,
                        id: true,
                        sentAt: true,
                    }
                },
            },
            take: 15,
            orderBy: {
                lastMessageDate: "desc"
            }
        });
    }),
    getSuggestions: privateProcedure.input(z.object({
        accountId: z.string(),
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
        return await ctx.db.emailAddress.findMany({
            where: {
                accountId: account.id
            },
            select: {
                address: true,
                name: true
            }
        });
    }),
    getReplyDetails: privateProcedure.input(z.object({
        accountId: z.string(),
        threadId: z.string()
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
        const thread = await ctx.db.thread.findFirst({
            where: {
                id: input.threadId,
            },
            include: {
                emails: {
                    orderBy: { sentAt: 'asc' },
                    select: {
                        from: true,
                        to: true,
                        sentAt: true,
                        subject: true,
                        internetMessageId: true
                    }
                }
            }
        });
        if (!thread || thread.emails.length === 0) throw new Error('Thread not found');

        const lastExternalEmail = thread.emails.reverse().find(email => email.from.address !== account.emailAddress);
        if (!lastExternalEmail) throw new Error('No external email found');

        return {
            subject: lastExternalEmail.subject,
            to: [lastExternalEmail.from, ...lastExternalEmail.to.filter(to => to.address !== account.emailAddress)],
            from: { name: account.name, address: account.emailAddress },
            id: lastExternalEmail.internetMessageId
        };
    }),
    sendEmail: privateProcedure.input(z.object({
        accountId: z.string(),
        email: z.object({
            from: emailAddressSchema,
            to: z.array(emailAddressSchema),
            subject: z.string(),
            cc: z.array(emailAddressSchema).optional(),
            bcc: z.array(emailAddressSchema).optional(),
            body: z.string(),
            replyTo: emailAddressSchema,
            inReplyTo: z.string().optional(),
            threadId: z.string().optional()
        })
    })).mutation(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);

        const acc = new Account(
            account.token,
            process.env.REFRESH_TOKEN || '',
            process.env.CLIENT_ID || '',
            process.env.CLIENT_SECRET || ''
        );

        await acc.sendEmail({
            from: input.email.from,
            to: input.email.to,
            cc: input.email.cc,
            bcc: input.email.bcc,
            subject: input.email.subject,
            body: input.email.body,
            inReplyTo: input.email.inReplyTo,
            replyTo: input.email.replyTo,
            threadId: input.email.threadId // Ensure threadId is passed if available
        });
    }),
    /*searchEmails: privateProcedure.input(z.object({
        accountId: z.string(),
        query: z.string()
    })).mutation(async ({ctx, input}) => {
        const account = await authoriseAccountAccess(input.accountId,ctx.auth.userId)
        const orama =new OramaClient(account.id)
        await orama.initialize()
        const results = await orama.search({term: input.query})
        return results
    }),*/
    
});