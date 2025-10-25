// components/FC2BannerAd.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Size = "300x250" | "320x50";

export default function FC2BannerAd({
  size = "300x250",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  // 画面幅でスマホ時は 320x50 を優先
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const on = () => setIsMobile(window.innerWidth <= 400);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const chosen: Size = isMobile ? "320x50" : size;

  // HTML一発タグを環境変数から（安全な場所で配布される想定）
  const html =
    chosen === "300x250"
      ? process.env.NEXT_PUBLIC_FC2_BANNER_300x250_HTML
      : process.env.NEXT_PUBLIC_FC2_BANNER_320x50_HTML;

  // フォールバック（href/imgで構成）
  const fallback = useMemo(() => {
    if (chosen === "300x250") {
      return {
        href: process.env.NEXT_PUBLIC_FC2_BANNER_300x250_HREF || "#",
        img: process.env.NEXT_PUBLIC_FC2_BANNER_300x250_IMG || "",
        w: 300,
        h: 250,
      };
    }
    return {
      href: process.env.NEXT_PUBLIC_FC2_BANNER_320x50_HREF || "#",
      img: process.env.NEXT_PUBLIC_FC2_BANNER_320x50_IMG || "",
      w: 320,
      h: 50,
    };
  }, [chosen]);

  // コンテナのアスペクト
  const aspect =
    chosen === "300x250" ? "300 / 250" : "320 / 50";

  return (
    <div
      className={[
        "mx-auto flex w-full items-center justify-center rounded-2xl bg-black/80 p-3",
        className || "",
      ].join(" ")}
      style={{ aspectRatio: aspect }}
      aria-label={`fc2-banner-${chosen}`}
    >
      {/* 1) 完全タグがある場合はそのまま描画 */}
      {html ? (
        <div
          className="w-full max-w-[92vw] overflow-hidden text-center"
          // FC2配布の静的タグのみを想定（script含まないimg+linkタグ）
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        // 2) 画像+リンクのフォールバック
        <a
          href={fallback.href}
          target="_blank"
          rel="nofollow noopener sponsored"
          className="inline-block"
          style={{ width: fallback.w, height: fallback.h }}
        >
          {fallback.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fallback.img}
              alt="ad"
              width={fallback.w}
              height={fallback.h}
              style={{ display: "block", width: fallback.w, height: fallback.h }}
            />
          ) : (
            <div className="grid h-full w-full place-content-center text-xs opacity-60">
              FC2バナー（{chosen}）を設定してください
            </div>
          )}
        </a>
      )}
    </div>
  );
}
