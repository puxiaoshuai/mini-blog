import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LocatorSetup from "@/components/common/LocatorSetup";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
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
import "../globals.css";

/** 全站唯一根布局（app/[locale]）：渲染 <html lang>，供 /zh /en 两个语言各自静态生成 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "common" });
  const title = t("meta.titleDefault");
  const description = t("meta.description");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: t("meta.titleTemplate"),
    },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      siteName: t("siteName"),
      url: `${SITE_URL}/${locale}`,
    },
    robots: { index: true, follow: true },
  };
}

/** 防闪白：同步读取主题，先于首帧渲染 */
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t===null)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-paper text-ink font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <NextIntlClientProvider>
          {process.env.NODE_ENV === "development" && <LocatorSetup />}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
