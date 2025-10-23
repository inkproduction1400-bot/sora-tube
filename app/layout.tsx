// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import AgeGate from "@/components/AgeGate";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script"; // ← 追加（SDKを全ページで1回だけ読む）

// ExoClick などのサイト所有確認（meta name と content を環境変数から）
const EXO_NAME =
  process.env.NEXT_PUBLIC_EXO_SITE_VERIFICATION_NAME || "exo-site-verification";
const EXO_TOKEN = process.env.NEXT_PUBLIC_EXO_SITE_VERIFICATION || "";

export const metadata: Metadata = {
  title: "SoraTube",
  description: "AI縦型ショート動画",
  other: EXO_TOKEN ? { [EXO_NAME]: EXO_TOKEN } : { [EXO_NAME]: "" },
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

        {/* ExoClick / MagSrv SDK を全ページで1回だけ読み込む */}
        <Script
          id="magsrv-sdk"
          src="https://a.magsrv.com/ad-provider.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
