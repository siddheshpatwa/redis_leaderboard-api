import "./config/env";
import express from "express";
import authRoutes from "./routes/auth.routes";
import { pool } from "./config/db";
import "./worker/score.worker";

const app = express();

async function startServer() {
  try {
const url = new URL(process.env.DATABASE_URL!);

// console.log("User:", url.username);
// console.log("Password exists:", !!url.password);
    const result = await pool.query("SELECT NOW()");
    console.log("Postgres Connected:", result.rows[0]);

    app.use(express.json());
    app.use("/api/auth", authRoutes);

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();