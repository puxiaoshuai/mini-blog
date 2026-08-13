import { notFound } from "next/navigation";
import { getAdminPostById } from "@/lib/posts";
import PostForm, { type PostFormData } from "@/components/admin/PostForm";

type Params = Promise<{ id: string }>;

export const metadata = { title: "编辑文章" };

export default async function EditPostPage({ params }: { params: Params }) {
  const { id } = await params;
  const post = await getAdminPostById(id);
  if (!post) notFound();

  const form: PostFormData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    coverImage: post.coverImage ?? "",
    published: post.published,
    tags: post.tags.map((t) => t.name),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-black">编辑文章</h1>
        <p className="mt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">EDIT POST · /{post.slug}</p>
      </header>
      <PostForm post={form} />
    </div>
  );
}
