// components/AdSlot.tsx
"use client";

import Script from "next/script";
import { useId } from "react";

export default function AdSlot() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  // ExoClick/MagSrv の Zone ID（例: 5755562）を .env から取得
  const zoneId = process.env.NEXT_PUBLIC_EXO_ZONE_ID;
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
      {/* ExoClick 発行タグ（Asynchronous Script 推奨）に準拠 */}
      <div id={domId} className="w-[320px] max-w-[90vw]">
        {/* 1) ライブラリ */}
        <Script
          id={`magsrv-sdk-${domId}`}
          src="https://a.magsrv.com/ad-provider.js"
          strategy="afterInteractive"
        />
        {/* 2) ゾーン用の ins（class は発行画面の値をそのまま使用） */}
        <ins className="eas6a97888e2" data-zoneid={zoneId}></ins>
        {/* 3) 初期化 */}
        <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
          {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
        </Script>
      </div>
    </div>
  );
}
