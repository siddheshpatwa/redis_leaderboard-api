import "../config/env";
import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { pool } from "../config/db";


const worker = new Worker(
  "scoreQueue",
  async (job) => {

    const { email, score } = job.data;


    // 1. Get current score from Postgres
    const result = await pool.query(
      `
      SELECT score 
      FROM users
      WHERE email=$1
      `,
      [email]
    );


    if (result.rows.length === 0) {
      throw new Error("User not found");
    }


    const currentScore = result.rows[0].score || 0;

    const newScore =
      currentScore + Number(score);



    // 2. Update PostgreSQL (permanent)
    await pool.query(
      `
      UPDATE users
      SET score=$1
      WHERE email=$2
      `,
      [
        newScore,
        email
      ]
    );



    // 3. Update Redis leaderboard (fast ranking)
    await redis.zadd(
      "leaderboard",
      newScore,
      email
    );


    console.log(
      `Updated ${email} => ${newScore}`
    );
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  }
);


console.log("Worker Started");