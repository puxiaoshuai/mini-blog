import PostForm from "@/components/admin/PostForm";

export const metadata = { title: "新建文章" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-black">新建文章</h1>
        <p className="mt-1 font-mono text-[10px] tracking-[.25em] text-inksoft">NEW POST</p>
      </header>
      <PostForm />
    </div>
  );
}
