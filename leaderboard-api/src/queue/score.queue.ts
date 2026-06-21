import "../config/env"; // must be first — loads .env before any other imports
import { Queue } from "bullmq";

export const scoreQueue = new Queue("scoreQueue",{
 connection:{
   host: process.env.REDIS_HOST,
   port:Number(process.env.REDIS_PORT)
 }
});


// await scoreQueue.add("update-score",{
//  email,
//  score
// });