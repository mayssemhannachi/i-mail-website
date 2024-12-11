import { create, insert, search, type AnyOrama } from "@orama/orama";
import { db } from "~/server/db";
import { persist, restore } from "@orama/plugin-data-persistence";
import { getEmbeddings } from "./embedding";

export class OramaClient {
    private orama!: AnyOrama;
    private accountId: string;

    constructor(accountId: string) {
        this.accountId = accountId;
    }

    async saveIndex() {
        if (!this.orama) {
            throw new Error('Orama instance is not initialized');
        }
        const index = await persist(this.orama, 'json');
        
        console.log('Index saved:', index);
        await db.account.update({
            where: { id: this.accountId },
            data: { binaryIndex: index as Buffer }
        });
    }

    async initialize() {
        const account = await db.account.findUnique({
            where: { id: this.accountId },
        });

        if (!account) {
            throw new Error('Account not found');
        }
        console.log('Account retrieved:', account);

        if (account.binaryIndex) {
            try {
                this.orama = await restore('json', account.binaryIndex as any);
                // Check if the restored schema matches the expected schema
                if (!this.orama.schema || !this.orama.schema.embeddings || this.orama.schema.embeddings.size !== 768) {
                    throw new Error('Schema mismatch');
                }
            } catch (error) {
                console.log('Error restoring index, re-initializing:', error);
                await this.createNewIndex();
            }
        } else {
            await this.createNewIndex();
        }
    }

    async createNewIndex() {
        this.orama = await create({
            schema: {
                subject: 'string',
                body: 'string',
                rawBody: 'string',
                from: 'string',
                to: 'string[]',
                sentAt: 'string',
                embeddings: 'vector[768]',
                threadId: 'string'
            }
        });
        await this.saveIndex();
    }

    async vectorSearch({ term }: { term: string }) {
        if (!this.orama) {
            throw new Error('Orama instance is not initialized');
        }
        const embeddings = await getEmbeddings(term);
        const results = await search(this.orama, {
            mode: 'hybrid',
            term: term,
            vector: {
                value: embeddings,
                property: 'embeddings'
            },
            similarity: 0.8,
            limit: 10
        });
        return results;
    }

    async insert(document: any) {
        if (!this.orama) {
            throw new Error('Orama instance is not initialized');
        }
        console.log('Orama instance:', this.orama);
        console.log('Document:', document);

        if (typeof document.to === 'string') {
            document.to = [document.to];
        }

        await insert(this.orama, document);
        await this.saveIndex();
    }
}