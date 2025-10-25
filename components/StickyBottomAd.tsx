// components/StickyBottomAd.tsx
"use client";

import { usePathname } from "next/navigation";
import FC2BannerInline from "@/components/FC2BannerInline";

/**
 * ページ最下部に固定表示する FC2 320x50 バナー。
 * /watch 系（縦動画プレイヤー）では非表示にして競合回避。
 */
export default function StickyBottomAd() {
  const pathname = usePathname();
  if (pathname?.startsWith("/watch")) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-2"
      aria-label="sticky-bottom-ad"
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto w-[320px] max-w-[92vw] py-1">
          <FC2BannerInline variant="320x50" />
        </div>
      </div>
    </div>
  );
}
