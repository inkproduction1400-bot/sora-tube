// components/StickyBottomAd.tsx
"use client";

import Script from "next/script";
import { useId } from "react";

export default function StickyBottomAd() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const zoneId = process.env.NEXT_PUBLIC_EXO_ZONE_ID_BOTTOM || process.env.NEXT_PUBLIC_EXO_ZONE_ID;
  const cls = process.env.NEXT_PUBLIC_EXO_CLASS_STICKY || "eas6a97888e17"; // ← ここをenv駆動
  const domId = useId().replace(/:/g, "_");

  if (!enabled || !zoneId) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-2">
      <div className="rounded-lg bg-black/70 px-2 py-2 backdrop-blur">
        <div id={domId} className="w-[320px] max-w-[92vw]">
          <Script id={`magsrv-sdk-${domId}`} src="https://a.magsrv.com/ad-provider.js" strategy="afterInteractive" />
          <ins className={cls} data-zoneid={zoneId}></ins>
          <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
            {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
          </Script>
        </div>
      </div>
    </div>
  );
}
