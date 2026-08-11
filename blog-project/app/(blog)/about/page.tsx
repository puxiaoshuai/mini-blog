import type { Metadata } from "next";
import Placeholder from "@/components/common/Placeholder";

export const metadata: Metadata = { title: "关于我" };

export default function AboutPage() {
  return (
    <Placeholder
      title="关于我"
      desc="一个 TypeScript 全栈程序员。作者卡、技能条、时间线（待真实信息）。"
    />
  );
}
