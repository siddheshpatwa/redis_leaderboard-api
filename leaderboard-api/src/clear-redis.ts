import "../src/config/env";
import { redis } from "./config/redis";

async function clearRedis() {
  try {
    await redis.flushall();

    console.log("✅ Redis cleared");

    await redis.quit();
  } catch (error) {
    console.error("Redis clear failed", error);
  }
}

clearRedis();