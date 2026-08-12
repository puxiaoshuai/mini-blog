import { Hono } from "hono";
import { posts } from "./posts";
import { shiyu } from "./shiyu";
import { comments } from "./comments";
import { search } from "./search";

/** Hono API 根应用：basePath('/api')，所有 /api/* 请求由它接管 */
const app = new Hono().basePath("/api");

app.route("/posts", posts);
app.route("/shiyu", shiyu);
app.route("/comments", comments);
app.route("/", search); // 内含 GET /search

export default app;
