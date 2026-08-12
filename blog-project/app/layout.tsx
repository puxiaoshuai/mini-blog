import type { Metadata } from "next";
import LocatorSetup from "@/components/common/LocatorSetup";
// 字体走 npm（@fontsource），随安装下载，国内网络无需访问 Google Fonts
import "@fontsource/noto-serif-sc/500.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/noto-serif-sc/900.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";

const SITE_URL = "https://www.puxiaoshuai.top";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "大道至简 · 时光是画在卷上的河流",
    template: "%s · 大道至简",
  },
  description:
    "一个记录 AI、技术、设计日常与随手拾语的独立博客。时光是画在卷上的河流。",
  openGraph: {
    title: "大道至简 · 时光是画在卷上的河流",
    description: "一个记录 AI、技术、设计日常与随手拾语的独立博客。",
    type: "website",
    locale: "zh_CN",
    siteName: "大道至简",
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

/** 防闪白：同步读取主题，先于首帧渲染 */
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t===null)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="bg-paper text-ink font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {process.env.NODE_ENV === "development" && <LocatorSetup />}
        {children}
      </body>
    </html>
  );
}
