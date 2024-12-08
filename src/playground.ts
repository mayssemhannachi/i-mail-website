import { create,insert,search,type AnyOrama } from "@orama/orama";
import { db } from "./server/db";
import { OramaClient } from "./lib/orama";

const orama = new OramaClient("113796921595510120670")
await orama.initialize()




const searchResult= await orama.search ({
    term : "goo"
})
for(const hit of searchResult.hits){
    console.log(hit.document.subject)
}
