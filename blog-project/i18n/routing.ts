import { defineRouting } from "next-intl/routing";

/** 支持语言：中文（默认）、英文。URL 前缀 /zh /en */
export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
});

export type Locale = (typeof routing.locales)[number];
