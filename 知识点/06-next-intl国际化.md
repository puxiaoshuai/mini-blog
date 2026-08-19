# 第 6 节 · 国际化：next-intl

> 博客要中英双语言，且 URL 带前缀（`/zh`、`/en`），每个语言还各自静态生成。
> 这一节讲 next-intl 的三个配置文件、`[locale]` 动态段，以及 Server/Client 组件里怎么取文案。

---

## 一、总体结构

```
i18n/
├── routing.ts      # 语言定义（哪些语言、默认语言）
├── request.ts      # 请求时解析 locale 并加载字典
└── navigation.ts   # 封装的 Link/redirect/usePathname（自动带前缀）
messages/
├── zh.json         # 中文文案
└── en.json         # 英文文案
app/[locale]/       # 动态段：/zh/* 和 /en/* 共用同一套页面代码
```

## 二、routing.ts —— 语言定义

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
});
export type Locale = (typeof routing.locales)[number];
```

就两件事：支持哪些语言、默认哪个。

## 三、request.ts —— 请求时解析语言

```ts
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;          // 不支持的语言回退中文

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,  // 按语言加载字典
  };
});
```

- `next.config.ts` 里的插件 `createNextIntlPlugin("./i18n/request.ts")` 就指向这里，它会在每个请求时调用。
- `requestLocale` 来自 URL 的 `[locale]` 段。
- `import(\`../messages/${locale}.json\`)` 是**动态 import**，构建时只打包用到的语言文件，不会把中英文全塞进 bundle。

## 四、navigation.ts —— 免前缀编程

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

这是项目里**所有内部跳转都走 `@/i18n/navigation`** 的原因：
- `Link href="/posts"` 会自动渲染成 `/zh/posts` 或 `/en/posts`；
- `redirect({ href: "/login", locale })` 跳转自动带当前语言前缀；
- `usePathname()` 返回的路径**不带** `/zh` 前缀，方便逻辑判断。

> 副作用：项目里统一 `import { Link } from "@/i18n/navigation"`，而**不是** `next/link`。搜索代码时能看到这个统一入口。

## 五、Server Component 里取文案

页面是 Server Component，用 `getTranslations` 拿对应字典，并 `setRequestLocale` 配合静态生成：

```tsx
export default async function Home({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);          // 标记此页按 locale 静态生成
  const t = await getTranslations("home");      // 取 home 命名空间的文案
  const common = await getTranslations("common");
  return <p>{t("hero.subtitle")}</p>;
}
```

**为什么要 `setRequestLocale`**：它告诉 Next「这个页面的渲染依赖 locale」，从而允许 `/zh` `/en` 各自静态生成（第 5 节的 `generateStaticParams` 返回 `['zh','en']` 才能生效）。每个 `[locale]` 下的页面都必须调用它，否则双语言静态化不会工作。

`params` 在 Next 16 是 **Promise**，必须 `await`：
```tsx
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  ...
}
```

## 六、Client Component 里取文案

交互组件（评论、点赞、导航）是 client，用 hooks：

```tsx
"use client";
import { useTranslations } from "next-intl";
export default function CommentForm() {
  const t = useTranslations("blog.commentForm");
  return <button>{t("submit")}</button>;
}
```

## 七、带参数/复数的文案

`messages/zh.json` 里支持插值和复数（next-intl 用 ICU 语法）：

```json
{
  "common": {
    "units": { "viewsCount": "{views} 次浏览" }
  },
  "posts": {
    "likesCount": "{count, plural, other{# 个赞}}"
  }
}
```

使用：
```tsx
common("units.viewsCount", { views: post.views });
t("likesCount", { count: likes });
```

## 八、双语言 URL 的 SEO 配合

`app/sitemap.ts` 里给每个页面生成双语 `alternates`，告诉搜索引擎两个语言页面的对应关系（第 9 节详述）：

```ts
alternates: {
  languages: { zh: `${BASE}/zh${p}`, en: `${BASE}/en${p}` },
}
```

## 九、本节小结

- **三个文件**：`routing.ts`（语言）、`request.ts`（解析+加载字典）、`navigation.ts`（跳转封装）。
- **`[locale]` 动态段** + `generateStaticParams` → `/zh` `/en` 各自静态生成。
- **Server 组件**用 `getTranslations` + `setRequestLocale`；**Client 组件**用 `useTranslations`。
- **跳转一律走 `@/i18n/navigation`**，自动带语言前缀。
- 字典动态 import，只打包用到的语言。

下一节：**MDX 内容渲染 —— 正文怎么写、mermaid 怎么转组件、目录怎么提取**。
