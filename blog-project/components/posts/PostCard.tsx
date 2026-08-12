import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { PostCard as PostCardData } from "@/lib/posts";
import Highlight from "./Highlight";

/**
 * 封面块：图片（或标签占位）+ 渐变遮罩 + 内描边 + 角标标签。
 * 首页精选大卡与普通卡片共用；className / sizes / priority 按布局微调。
 */
export function PostCover({
  image,
  alt,
  tagName,
  className = "aspect-[16/9] border-b border-line",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
}: {
  image: string | null;
  alt: string;
  tagName?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-paper2">
          <span className="chip text-ink">{tagName ?? "文章"}</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/10" />
      {tagName && (
        <span className="chip absolute bottom-3 left-3 bg-paper/90 text-ink">
          {tagName}
        </span>
      )}
    </div>
  );
}

/** 普通文章卡片（杂志网格用）：封面 + 日期/阅读时长/阅数 + 标题 + 摘要；可传 q 高亮命中 */
export default function PostCard({
  post,
  q,
  delay,
}: {
  post: PostCardData;
  q?: string;
  delay?: string;
}) {
  return (
    <article className="reveal" style={delay ? { animationDelay: delay } : undefined}>
      <Link
        href={`/posts/${post.slug}`}
        className="card-raise group block h-full border border-line bg-card transition-colors hover:border-ink"
      >
        <PostCover image={post.coverImage} alt={post.title} tagName={post.tags[0]?.name} />
        <div className="p-5">
          <p className="font-mono text-[10px] tracking-[.15em] text-inksoft">
            {formatDate(post.createdAt)} · {post.readingMinutes} MIN · {post.views} 阅
          </p>
          <h3 className="title-hover mt-2 font-serif text-lg font-bold leading-snug transition-colors group-hover:text-accent">
            {q ? <Highlight text={post.title} q={q} /> : post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-inksoft">
              {q ? <Highlight text={post.excerpt} q={q} /> : post.excerpt}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
