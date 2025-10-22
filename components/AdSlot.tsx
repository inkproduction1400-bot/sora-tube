// components/AdSlot.tsx
"use client";

import Script from "next/script";
import { useId } from "react";

export default function AdSlot() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const zoneId = process.env.NEXT_PUBLIC_EXO_ZONE_ID; // 例: "5754850"
  const domId = useId().replace(/:/g, "_");

  if (!enabled || !zoneId) {
    return (
      <div className="flex h-[90vh] items-center justify-center rounded-2xl bg-white/5 text-sm opacity-60">
        広告（準備中）
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] items-center justify-center rounded-2xl bg-black/80">
      {/* 管理画面で表示された「Asynchronous Script（Recommended）」の構成に合わせる */}
      <div id={domId} className="w-[320px] max-w-[90vw]">
        {/* 1) ライブラリ */}
        <Script
          id={`magsrv-sdk-${domId}`}
          src="https://a.magsrv.com/ad-provider.js"
          strategy="afterInteractive"
        />
        {/* 2) ins タグ（class は管理画面の表示値に合わせる） */}
        <ins className="eas6a97888e2" data-zoneid={zoneId}></ins>
        {/* 3) 初期化（AdProvider 方式） */}
        <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
          {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
        </Script>
      </div>
    </div>
  );
}
