import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SessionWarden } from "@/components/auth/SessionWarden";
import { UserProvider } from "@/providers/UserProvider";

export const metadata: Metadata = {
  title: "CardWise",
  description: "카드, 가계부, 혜택, 바우처, 실적 화면을 아우르는 CardWise 앱입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#fb7185" />
      </head>
      <body className="theme-blossom">
        <UserProvider>
          <SessionWarden>
            {children}
          </SessionWarden>
        </UserProvider>
      </body>
    </html>
  );
}
