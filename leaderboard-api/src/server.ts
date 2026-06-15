import express from "express";
import authRoutes from "./routes/auth.routes";
import dotenv from "dotenv";

dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);


app.listen(3000, () => {
  console.log("Server running on port 3000");
});