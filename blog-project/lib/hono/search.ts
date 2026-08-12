import { Hono } from "hono";
import { searchPosts } from "@/lib/posts";

/** 搜索路由（挂载于 /，app.basePath('/api') 后即 /api/search） */
export const search = new Hono().get("/search", async (c) => {
  const q = c.req.query("q") ?? "";
  const results = await searchPosts(q);
  return c.json({ query: q, results });
});
