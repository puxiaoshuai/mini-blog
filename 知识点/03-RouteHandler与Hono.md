# 第 3 节 · API 层：Route Handler + Hono

> 这是整个项目最核心的架构决策：**只用一个 Next Route Handler，把 `/api/*` 全部转发给 Hono**。
> 这一节讲清楚 Route Handler 是什么、Hono 怎么挂进来、子路由怎么组织、错误怎么统一。

---

## 一、先理解 Next.js Route Handler

App Router 里，`app/api/` 目录下的每个 `route.ts` 文件就是一个 API 端点。导出 HTTP 方法同名函数即可：

```ts
// app/api/hello/route.ts
export async function GET(request: Request) {
  return Response.json({ message: "hello" });
}
```

- 目录层级 = 路径（`app/api/a/b/route.ts` → `/api/a/b`）；
- 导出 `GET/POST/PUT/DELETE/PATCH` 对应不同方法；
- 是 **Server 环境**，能读 `cookies()`、能连数据库，天然适合做 API。

**局限**：每个端点一个文件。博客要 20+ 个接口（文章 CRUD、评论、拾语、搜索、点赞…），会堆出 20+ 个文件，而且共享逻辑（限流、鉴权、统一响应）只能靠复制或手搓封装。

## 二、为什么引入 Hono

Hono 是一个极轻量的 Web 框架（几 KB，跑在任何 JS 运行时上）。把 API 交给它，换来三样东西：

1. **一条路由一个方法链** —— 同一个资源的所有方法写在一个文件里，职责聚合（下面 `posts.ts` 就是典型）。
2. **中间件生态** —— 鉴权、限流、日志都是 `app.use()` 挂一层。
3. **统一响应** —— `c.json()` 带状态码一把梭，JSON 输出不再手写 `Response.json`。

代价极小：Hono 和 Next 都遵循 Fetch API 标准（`Request`/`Response`），可以无缝互转。

## 三、核心集成：一个 catch-all Route Handler

`app/api/[[...route]]/route.ts`
```ts
import { handle } from "hono/vercel";
import app from "@/lib/hono/app";

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
```

拆开看：
- `[[...route]]` 是 **可选 catch-all**：匹配 `/api` 下任意层级路径（`/api/posts`、`/api/posts/abc/like` 都进这里）。
- `hono/vercel` 的 `handle(app)` 返回一个标准 HTTP handler 函数，正好是 Next Route Handler 要的签名。
- 于是 **四个方法统一转发给同一个 Hono app**，Hono 内部按路径和方法再路由。

### NextAuth 不受影响

`app/api/auth/[...nextauth]/route.ts` 路径更具体（`/api/auth/...`），Next 的路由优先级是**越具体越先匹配**，所以认证请求先落在 NextAuth，不会和 catch-all 冲突。

## 四、Hono 根应用：basePath + 子路由

`lib/hono/app.ts`
```ts
import { Hono } from "hono";
import { posts } from "./posts";
import { shiyu } from "./shiyu";
import { comments } from "./comments";
import { search } from "./search";

const app = new Hono().basePath("/api");

app.route("/posts", posts);
app.route("/shiyu", shiyu);
app.route("/comments", comments);
app.route("/", search);   // 内含 GET /search

export default app;
```

要点：
- **`basePath("/api")`**：所有路由自动带 `/api` 前缀，和 Next 的 `app/api` 目录位置对齐。
- **`app.route("/posts", posts)`**：挂载子应用。`posts` 内部写 `.get("/")`、`.get("/:id")`、`.post("/:id/like")`，拼上 basePath 就是 `/api/posts`、`/api/posts/:id`、`/api/posts/:id/like`。
- **子应用独立成文件**：一个资源一个模块，每个模块内部方法聚合。

## 五、子应用写法：以 posts 为例

`lib/hono/posts.ts` 结构（一个文件管全 CRUD + 点赞/浏览）：

```ts
export const posts = new Hono()
  .get("/", async (c) => { ... })            // GET  /api/posts          分页列表
  .post("/", async (c) => { ... })           // POST /api/posts          新建（ADMIN）
  .get("/:id", async (c) => { ... })         // GET  /api/posts/:id      详情
  .put("/:id", async (c) => { ... })         // PUT  /api/posts/:id      更新（ADMIN）
  .delete("/:id", async (c) => { ... })      // DELETE /api/posts/:id    删除（ADMIN）
  .post("/:id/like", async (c) => { ... })   // POST /api/posts/:id/like 点赞
  .post("/:id/view", async (c) => { ... });  // POST /api/posts/:id/view 浏览
```

方法链可读性强，一个资源的所有行为一目了然。每个 handler 里拿到 Hono 的 `Context c`：
- `c.req.query("page")` —— 取 query 参数
- `c.req.param("id")` —— 取路径参数
- `c.req.json()` —— 解析请求体
- `c.json(data, status)` —— 统一 JSON 响应（状态码）

## 六、统一的校验与错误模式

项目里每个写操作都遵循同一套「防御式解析」，可直接抄：

```ts
// 1. 鉴权放最前
const session = await requireAdmin();
if (!session) return c.json({ error: "未登录或权限不足" }, 401);

// 2. JSON 解析包 try/catch，非法体给 400
let body: PostBody;
try {
  body = await c.req.json();
} catch {
  return c.json({ error: "请求体不是合法 JSON" }, 400);
}

// 3. 字段校验（trim + 非空）
const title = body.title?.trim();
if (!title) return c.json({ error: "标题不能为空" }, 400);

// 4. 业务冲突：唯一约束冲突转 409（P2002 是 Prisma 唯一键错误码）
try {
  // ...prisma 操作
} catch (e) {
  if (e instanceof Error && (e as { code?: string }).code === "P2002") {
    return c.json({ error: "slug 已存在，请更换" }, 409);
  }
  throw e;   // 其他错误上抛，交给框架
}
```

**统一响应形状**：成功 `{ data }`，失败 `{ error: "中文提示" }`。前端只要判断 `!res.ok` 就取 `data.error` 展示，全站交互一致。

## 七、分页参数防御

```ts
const page = Math.max(1, Number(c.req.query("page")) || 1);
const pageSize = Math.min(50, Math.max(1, Number(c.req.query("pageSize")) || 20));
```

- 负数 / 0 → 钳到 1；
- 超大 pageSize → 钳到 50，防止一次拉爆。

## 八、本节小结

- **一个 catch-all `[[...route]]/route.ts`** 把 `/api/*` 全量转发给 Hono，`hono/vercel` 的 `handle()` 就是桥梁。
- **NextAuth 路由更具体，优先匹配**，不冲突。
- Hono 根应用 `basePath('/api')` + 子应用按资源拆分，一个文件一个资源。
- 防御式解析 + 统一 `{ error }` 响应 + P2002 转 409，是全部 API 的共同范式。

下一节：**认证 —— NextAuth 凭证登录、JWT session、ADMIN 双防线**。
