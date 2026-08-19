# 第 9 节 · SEO 优化

> 博客要让人搜得到。这一节讲 Next App Router 的 SEO 三件套：`sitemap.ts`、`robots.ts`、`generateMetadata`，
> 再加上 JSON-LD 结构化数据（让 Google 识别文章卡片），以及双语 URL 的 hreflang 配合。

---

## 一、三件套在项目里的位置

```
app/
├── sitemap.ts    # /sitemap.xml —— 站点地图（动态生成）
├── robots.ts     # /robots.txt —— 爬虫协议
└── [locale]/layout.tsx  # generateMetadata —— 全站默认 <head>
    └── (blog)/posts/[slug]/page.tsx  # 文章级 generateMetadata + JSON-LD
```

## 二、sitemap.ts —— 站点地图

Next 约定：在 `app/sitemap.ts` 导出一个默认函数，自动生成 `/sitemap.xml`。

```ts
import { getPublishedPostRefs } from "@/lib/posts";

const BASE = "https://www.puxiaoshuai.top";
const LOCALES = ["zh", "en"] as const;
const STATIC_PATHS = ["", "/posts", "/tags", "/shiyu", "/about", "/search"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPostRefs();   // 从 DB 拉已发布文章

  // 静态页：每个语言一份，双语 alternates
  const staticRoutes = STATIC_PATHS.flatMap((p) =>
    LOCALES.map((locale) => ({
      url: `${BASE}/${locale}${p}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          zh: `${BASE}/zh${p}`,
          en: `${BASE}/en${p}`,
        },
      },
    }))
  );

  // 文章页：每篇文章每个语言一份
  const postRoutes = posts.flatMap((p) =>
    LOCALES.map((locale) => ({
      url: `${BASE}/${locale}/posts/${p.slug}`,
      lastModified: p.createdAt,
      alternates: { languages: { zh: `...`, en: `...` } },
    }))
  );

  return [...staticRoutes, ...postRoutes];
}
```

要点：
- **动态生成** —— 构建时查库，文章增删后 sitemap 自动变化（配合第 5 节的构建流程）。
- **双语 `alternates.languages`** —— 告诉搜索引擎 `/zh/posts/x` 和 `/en/posts/x` 是**同一内容的两个语言版本**，这就是 XML 里的 hreflang，避免被判定为重复内容。
- **只列已发布** —— `getPublishedPostRefs` 只查 `published: true`，草稿不进索引。

## 三、robots.ts —— 爬虫协议

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/", "/zh/dashboard", "/en/dashboard"],
    }],
    sitemap: "https://www.puxiaoshuai.top/sitemap.xml",
  };
}
```

- **禁爬后台和 API** —— `/dashboard` 和 `/api/*` 不允许被索引（虽然它们本来就要求登录，双保险）。
- 声明 sitemap 位置，方便爬虫发现。

## 四、generateMetadata —— 页面级 SEO

### 全站默认（根布局）

`app/[locale]/layout.tsx`：

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    metadataBase: new URL(SITE_URL),            // 相对路径的基准域名
    title: {
      default: t("meta.titleDefault"),          // 默认标题
      template: t("meta.titleTemplate"),        // 子页面标题模板
    },
    description: t("meta.description"),
    openGraph: {
      title, description, type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",   // 语言对应的 og:locale
      siteName: t("siteName"),
    },
  };
}
```

- `metadataBase` —— 有了它，Metadata 里写相对路径会补全成绝对 URL。
- `title.template` —— 模板字符串（如 `"%s · 大道至简"`），子页面只需给 `title`，自动套模板。
- **按 locale 取翻译** —— `/zh` 和 `/en` 的 `<title>` / `<description>` 是各自语言的。

### 文章页（覆盖默认）

`posts/[slug]/page.tsx`：

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(slug);       // 构建时查库
  return {
    title: post?.title ?? t("title"),
    description: post?.excerpt,
    alternates: { canonical: `/${locale}/posts/${slug}` },   // 规范链接
    openGraph: {
      title: post?.title,
      description: post?.excerpt,
      type: "article",
      publishedTime: post?.createdAt?.toISOString(),  // 文章发布时间
      ...(post?.coverImage ? { images: [post.coverImage] } : {}),  // 分享卡片图
    },
  };
}
```

- `canonical` —— 声明本文的规范 URL，配合双语时每个语言指向自己的 URL。
- `openGraph.type: "article"` + `publishedTime` —— 微信/推特/Google 分享时能渲染成文章卡片。

## 五、JSON-LD 结构化数据（文章页内）

Next 页面里直接内联 `<script type="application/ld+json">`，给搜索引擎喂结构化数据：

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.createdAt,
      author: { "@type": "Person", name: authorName },
      image: post.coverImage,
      url: `https://www.puxiaoshuai.top/${locale}/posts/${post.slug}`,
    }),
  }}
/>
```

`BlogPosting` 类型让 Google 能识别出「这是一篇文章」，有机会出现在富媒体结果（富摘要）里。

## 六、其他 SEO 细节

1. **语义化标题层级** —— 首页 `h1` 只出现一次（Hero 标题），区块用 `h2`；文章页 `h1` 是文章标题。
2. **`next/image`** —— 自动生成 `srcset` 响应式尺寸，图片有 `alt`（项目里封面 alt 用文章标题）。
3. **静态 HTML + 预取** —— SSG 页面爬虫直接拿 HTML，不需要 JS 执行（对 SEO 最友好）。
4. **robots meta 不在页面加** —— 靠 `robots.ts` 全站控制更省事。
5. **SITE_URL 常量** —— `https://www.puxiaoshuai.top` 集中定义在 `[locale]/layout.tsx` 顶部，metadataBase / canonical / JSON-LD 引用同一处，换域名只改一处。

## 七、本节小结

- **`sitemap.ts`** —— 动态生成，静态页 + 文章页 × 双语言，`alternates.languages` 做 hreflang。
- **`robots.ts`** —— 允许全站、禁爬 `/dashboard` 和 `/api`。
- **`generateMetadata`** —— 根布局给默认 + 模板，文章页给标题/描述/OG/canonical。
- **JSON-LD `BlogPosting`** —— 让搜索引擎结构化识别文章，冲富摘要。
- **一处 SITE_URL**，换域名只改一个常量。

下一节：**部署运维 —— 宝塔 Nginx + PM2，以及三个必踩的坑**。
