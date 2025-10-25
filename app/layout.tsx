// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import AgeGate from "@/components/AgeGate";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "SoraTube",
  description: "AI縦型ショート動画",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ！！！ここに "use client" は置かないこと（Server Componentのままにする）
  return (
    <html lang="ja">
      <body className="min-h-[100dvh] bg-black text-white flex flex-col">
        {/* 年齢ゲート（Client ComponentでもOK） */}
        <AgeGate />

        {/* ページ本体 */}
        <div className="flex-1">{children}</div>

        {/* フッター */}
        <footer className="border-t border-white/10 px-4 py-6 text-sm">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 opacity-80">
            <span className="opacity-70">
              &copy; {new Date().getFullYear()} SoraTube
            </span>
            <nav className="flex items-center gap-4">
              <Link href="/" className="hover:underline">
                TOP
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </nav>
          </div>
        </footer>

        {/* Vercel Analytics（全ページ計測） */}
        <Analytics />

        {/* ※ Exo/MagSrv のグローバルSDKは読み込まない（FC2切替中） */}
      </body>
    </html>
  );
}
