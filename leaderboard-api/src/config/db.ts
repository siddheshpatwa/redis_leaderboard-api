import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

    console.log("DATABASE_URL from db.ts:", process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
});

pool.connect()
  .then(() => console.log("PostgreSQL Connected"))
  .catch((err) => console.error("DB Error:", err));