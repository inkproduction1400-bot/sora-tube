// components/StickyBottomAd.tsx
"use client";

import Script from "next/script";
import { useId } from "react";
import { usePathname } from "next/navigation";

export default function StickyBottomAd() {
  // Hooks は無条件で先頭で呼ぶ（rules-of-hooks対策）
  const pathname = usePathname();
  const domId = useId().replace(/:/g, "_");

  // 有効/無効（未設定なら true 扱い）
  const enabled =
    (process.env.NEXT_PUBLIC_AD_ENABLED ?? "true").toLowerCase() !== "false";

  // ゾーンID：新旧キー名に対応（本番の設定の取りこぼし防止）
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_ZONE_ID_BOTTOM ||
    process.env.NEXT_PUBLIC_EXO_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_ZONE_STICKY || // 念のため
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_ZONE_ID || // 旧命名
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM; // さらに旧命名

  // クラス名：新旧キー名に対応
  const cls =
    process.env.NEXT_PUBLIC_EXO_CLASS_STICKY ||
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_CLASS || // 旧命名
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM || // さらに旧命名
    "eas6a97888e17"; // デフォルト

  // /watch 配下では非表示（プレイヤーと競合回避）
  if (pathname?.startsWith("/watch")) return null;

  // 無効 or 未設定時は出さない
  if (!enabled || !zoneId || !cls) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-2"
      aria-label="sticky-bottom-ad"
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black/70 backdrop-blur">
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
