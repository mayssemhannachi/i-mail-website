import { create, insert, search, save, load, type AnyOrama } from "@orama/orama";
import { db } from "~/server/db";
import { persist, restore } from "@orama/plugin-data-persistence";
import { string } from "zod";


export class OramaClient {
    //@ts-ignore
    private orama: AnyOrama
    private accountId:string

    constructor (accountId:string){
        this.accountId=accountId
    }
    
    async saveIndex() {
        const index = await persist(this.orama, 'json');
        await db.account.update({
            where: { id: this.accountId },
            data: { binaryIndex: index as Buffer }
        });
    }
    
    async initialize(){
        const account = await db.account.findUnique({
            where:{id:this.accountId},
            
        })
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
                    embeddings: 'vector[1536]',
                    threadId: 'string'
                }
            });
            await this.saveIndex();
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
