import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export const chatRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1m"),
      prefix: "openprism::ratelimit::chat",
    })
  : null;

export const compileRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1m"),
      prefix: "openprism::ratelimit::compile",
    })
  : null;

export function getIP(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : "127.0.0.1";
}
