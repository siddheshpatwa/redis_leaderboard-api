// import "../config/env"; // must be first — loads .env before any other imports
// import { Queue } from "bullmq";

// export const scoreQueue = new Queue("scoreQueue",{
//  connection:{
//    host: process.env.REDIS_HOST,
//    port:Number(process.env.REDIS_PORT)
//  }
// });


// // await scoreQueue.add("update-score",{
// //  email,
// //  score
// // });
import "../config/env";
import { Queue } from "bullmq";

const redisUrl = new URL(
  process.env.REDIS_URL!
);

export const scoreQueue = new Queue(
  "scoreQueue",
  {
    connection: {
      host: redisUrl.hostname,
      port: Number(redisUrl.port),
    },
  }
);