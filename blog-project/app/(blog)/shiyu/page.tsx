import type { Metadata } from "next";
import Placeholder from "@/components/common/Placeholder";

export const metadata: Metadata = { title: "拾语" };

export default function ShiyuPage() {
  return (
    <Placeholder
      title="拾语"
      desc="一句话，或一句话加一张图。动态流时间线（M3 实现）。"
    />
  );
}
