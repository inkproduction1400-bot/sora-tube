// components/StickyBottomAd.tsx
"use client";

import Script from "next/script";
import { useId, useMemo } from "react";
import { usePathname } from "next/navigation";

export default function StickyBottomAd() {
  // Hooksは無条件で先頭呼び出し
  const pathname = usePathname();
  const domId = useId().replace(/:/g, "_");

  // ====== 環境変数 ======
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";

  // ゾーン情報（ExoClickの「Asynchronous Script」の class と zoneid）
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_ZONE_ID_BOTTOM ||
    process.env.NEXT_PUBLIC_EXO_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_ZONE_ID || // 互換
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM;      // 互換

  const cls =
    process.env.NEXT_PUBLIC_EXO_CLASS_STICKY ||
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_CLASS || // 互換
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM || // 互換
    "eas6a97888e17";

  // ★ 追加: 予約高さ（px）。例: 50 / 60 / 90 など
  const reserveMinPx = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_EXO_STICKY_MIN || process.env.NEXT_PUBLIC_EXO_RESERVE_MIN;
    const n = raw ? parseInt(raw, 10) : NaN;
    // デフォルトは 60px（300x50/320x50 を少し余裕を持って）
    return Number.isFinite(n) && n > 0 ? n : 60;
  }, []);

  // /watch では出さない（プレイヤーと競合回避）
  if (pathname?.startsWith("/watch")) return null;
  if (!enabled || !zoneId) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-2"
      aria-label="sticky-bottom-ad"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black/70 backdrop-blur"
        // ▼ ここで最小高さを確保
        style={{ minHeight: reserveMinPx }}
      >
        <div id={domId} className="mx-auto w-[320px] max-w-[92vw]">
          {/* 1) SDK */}
          <Script
            id={`magsrv-sdk-${domId}`}
            src="https://a.magsrv.com/ad-provider.js"
            strategy="afterInteractive"
          />
          {/* 2) ゾーンタグ */}
          <ins className={cls} data-zoneid={zoneId}></ins>
          {/* 3) 初期化 */}
          <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
            {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
          </Script>
        </div>
      </div>
    </div>
  );
}
