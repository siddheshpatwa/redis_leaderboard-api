import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL!);
console.log("REDIS_URL =", process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("Redis Connected");
});

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

// http://localhost:3000