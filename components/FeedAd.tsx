"use client";

import Script from "next/script";
import { useId } from "react";

export default function FeedAd() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";

  // ▼ Outstream 用ゾーン（ExoClick/MagSrv 管理画面の Asynchronous Script にある class と zone id）
  const outClass = process.env.NEXT_PUBLIC_EXO_OUTSTREAM_CLASS; // 例: "eas123abc456"
  const zoneId   = process.env.NEXT_PUBLIC_EXO_OUTSTREAM_ZONE_ID; // 例: "5760xxx"

  const domId = useId().replace(/:/g, "_");

  if (!enabled || !zoneId || !outClass) {
    return (
      <div className="flex h-[90vh] items-center justify-center rounded-2xl bg-white/5 text-sm opacity-60">
        広告（準備中）
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] items-center justify-center rounded-2xl bg-black/80">
      <div id={domId} className="w-[360px] max-w-[92vw]">
        {/* 1) SDK */}
        <Script
          id={`magsrv-sdk-${domId}`}
          src="https://a.magsrv.com/ad-provider.js"
          strategy="afterInteractive"
        />
        {/* 2) ゾーンタグ（class は管理画面の表示通りに） */}
        <ins className={outClass} data-zoneid={zoneId}></ins>
        {/* 3) 初期化 */}
        <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
          {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
        </Script>
      </div>
    </div>
  );
}
