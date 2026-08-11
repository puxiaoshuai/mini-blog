import type { Metadata } from "next";
import Placeholder from "@/components/common/Placeholder";

export const metadata: Metadata = { title: "文章" };

export default function PostsPage() {
  return (
    <Placeholder
      title="文章"
      desc="这里将按编辑精选与编号列表展示全部文章（M2 实现）。"
    />
  );
}
