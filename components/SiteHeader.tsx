// components/SiteHeader.tsx
"use client";

import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 mx-auto w-full max-w-md bg-gradient-to-b from-black to-transparent px-3 pt-3 pb-2">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-white">MISS</span>
          <span className="text-pink-400">AI</span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/search"
            className="rounded-xl bg-white/10 px-3 py-1.5 hover:bg-white/15"
          >
            🔍
          </Link>
          <span className="rounded-full bg-white/10 px-2 py-1 text-[12px]">
            🇯🇵
          </span>
          <button className="rounded-xl bg-white/10 px-3 py-1.5">☰</button>
        </div>
      </div>

      {/* 検索バー（装飾のみ /search に遷移） */}
      <Link
        href="/search"
        className="mt-3 block rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80 hover:bg-white/15"
      >
        例: 巨乳の金髪女子高生
      </Link>
    </header>
  );
}
