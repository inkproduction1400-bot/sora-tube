// components/StickyBottomAd.tsx
"use client";

import { useMemo, useState } from "react";

/**
 * 固定下部のFC2バナー（EXOは使わない）
 * - 320x50 を1枚表示
 * - HREF/IMGは環境変数経由で差し込み（本番とローカルで同一コード運用）
 *   - NEXT_PUBLIC_FC2_320x50_HREF
 *   - NEXT_PUBLIC_FC2_320x50_IMG
 */
export default function StickyBottomAd() {
  const enabled =
    (process.env.NEXT_PUBLIC_AD_ENABLED ?? "true").toLowerCase() !== "false";

  const href =
    process.env.NEXT_PUBLIC_FC2_320x50_HREF ||
    ""; // 例: https://cnt.affiliate.fc2.com/cgi-bin/click.cgi?...（あなたのタグ）
  const img =
    process.env.NEXT_PUBLIC_FC2_320x50_IMG ||
    ""; // 例: https://cnt.affiliate.fc2.com/cgi-bin/banner.cgi?...（あなたのタグ）

  // 予約高さ（px）: 320x50想定で60pxを既定
  const reserveMinPx = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_FC2_STICKY_MIN;
    const n = raw ? parseInt(raw, 10) : 60;
    return Number.isFinite(n) && n > 0 ? n : 60;
  }, []);

  const [closed, setClosed] = useState(false);

  // 表示条件
  if (!enabled || !href || !img || closed) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-2"
      aria-label="sticky-promo"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black/70 backdrop-blur"
        style={{ minHeight: reserveMinPx }}
      >
        {/* close */}
        <button
          onClick={() => setClosed(true)}
          title="閉じる"
          className="absolute right-2 top-2 rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
        >
          ×
        </button>

        {/* 本体（クラス名に ad/banner を含めない） */}
        <div className="mx-auto flex w-[320px] max-w-[92vw] items-center justify-center py-2">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="FC2 promotion"
          >
            <img
              src={img}
              width={320}
              height={50}
              alt=""
              decoding="async"
              loading="eager"
              style={{ display: "block" }}
            />
          </a>
        </div>
      </div>
    </div>
  );
}
