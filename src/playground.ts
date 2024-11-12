import { db } from "./server/db";

await db.user.create({
    data:{
        emailAddress:'test@gmail.com',
        firstName:'chahd',
        lastName:'atia'



}
}
)
console.log('done')