import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARISE PNU — 2 Design Concepts (Claude)",
  description:
    "부산대학교 AI 거점대학육성사업단(ARISE PNU) 사업 소개 페이지를 2개 레퍼런스 사이트 스타일로 재해석한 디자인 시안 모음입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
