import type { Metadata } from "next";
import Placeholder from "@/components/common/Placeholder";

export const metadata: Metadata = { title: "标签" };

export default function TagsPage() {
  return (
    <Placeholder
      title="标签索引"
      desc="左栏分类索引 + 按月归档时间线（M2 实现）。"
    />
  );
}
