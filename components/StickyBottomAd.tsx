"use client";

import Script from "next/script";
import { useId } from "react";

export default function StickyBottomAd() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const zoneId = process.env.NEXT_PUBLIC_EXO_ZONE_STICKY_BOTTOM; // 例: "5755608"
  const domId = useId().replace(/:/g, "_");

  if (!enabled || !zoneId) return null;

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-[60] flex justify-center pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mx-auto w-[320px] max-w-[92vw] rounded-t-xl bg-black/70 px-2 pt-2 pb-1 backdrop-blur">
          {/* 1) SDK */}
          <Script id={`magsrv-sdk-${domId}`} src="https://a.magsrv.com/ad-provider.js" strategy="afterInteractive" />
          {/* 2) ゾーン（class 名は Exo の UI に出た文字列でも OK。class は何でもよいが個別化推奨） */}
          <ins className="eas-sticky-bottom" data-zoneid={zoneId}></ins>
          {/* 3) 初期化 */}
          <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
            {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
          </Script>
        </div>
      </div>
    </div>
  );
}
