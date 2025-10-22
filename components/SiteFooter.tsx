"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname() || "/";

  // 視聴系ルートでは非表示（必要に応じて追加）
  const hideOn =
    pathname.startsWith("/watch/") ||
    pathname.startsWith("/c/");        // もっと→ の縦スワイプ

  if (hideOn) return null;

  return (
    <footer className="border-t border-white/10 px-4 py-6 text-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 opacity-80">
        <span className="opacity-70">&copy; {new Date().getFullYear()} SoraTube</span>
        <nav className="flex items-center gap-4">
          <Link href="/" className="hover:underline">TOP</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
