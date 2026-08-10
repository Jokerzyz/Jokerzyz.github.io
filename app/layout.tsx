import type { Metadata } from "next";
import "./globals.css";

const title = "ZHENYUAN ZHANG — 中文创意作品集";
const description =
  "一份以全屏转场、动态项目列表和分栏作品详情构成的中文创意作品集。";
const mediaOrigin = (
  process.env.NEXT_PUBLIC_MEDIA_ORIGIN || "https://media.zyrondesignz.com"
).replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL("https://zyrondesignz.com"),
  title,
  description,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [
      {
        url: "/portfolio-og.png",
        width: 1536,
        height: 1024,
        alt: "ZHENYUAN ZHANG 中文创意作品集",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/portfolio-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="dns-prefetch" href={mediaOrigin} />
        <link rel="preconnect" href={mediaOrigin} crossOrigin="anonymous" />
        <link
          rel="preload"
          href="/fonts/Anton-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Inter_Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
