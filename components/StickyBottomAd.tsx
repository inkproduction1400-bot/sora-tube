// components/StickyBottomAd.tsx
"use client";

import Script from "next/script";
import { useId } from "react";
import { usePathname } from "next/navigation";

export default function StickyBottomAd() {
  // Hooks は早めに無条件で呼ぶ（rules-of-hooks 回避）
  const pathname = usePathname();
  const domId = useId().replace(/:/g, "_");

  // 環境変数
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_ZONE_ID_BOTTOM ||
    process.env.NEXT_PUBLIC_EXO_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM; // 互換フォールバック
  const cls =
    process.env.NEXT_PUBLIC_EXO_CLASS_STICKY ||
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM ||
    "eas6a97888e17"; // 互換/デフォルト

  // /watch では表示しない（プレイヤーと競合回避）
  if (pathname?.startsWith("/watch")) return null;
  if (!enabled || !zoneId) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-2"
      aria-label="sticky-bottom-ad"
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black/70 backdrop-blur">
        <div id={domId} className="mx-auto w-[320px] max-w-[92vw]">
          {/* SDK */}
          <Script
            id={`magsrv-sdk-${domId}`}
            src="https://a.magsrv.com/ad-provider.js"
            strategy="afterInteractive"
          />
          {/* ゾーンタグ */}
          <ins className={cls} data-zoneid={zoneId}></ins>
          {/* 初期化 */}
          <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
            {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
          </Script>
        </div>
      </div>
    </div>
  );
}
