"use client";

import Script from "next/script";
import { useId } from "react";

export default function FloatingTopRightAd() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const zoneId = process.env.NEXT_PUBLIC_EXO_ZONE_FLOAT_TOPRIGHT; // 右上用に作ったゾーンID
  const domId = useId().replace(/:/g, "_");

  if (!enabled || !zoneId) return null;

  return (
    <div className="pointer-events-auto fixed right-2 top-2 z-[60]">
      <div className="rounded-xl bg-black/70 p-2 backdrop-blur">
        <Script id={`magsrv-sdk-${domId}`} src="https://a.magsrv.com/ad-provider.js" strategy="afterInteractive" />
        <ins className="eas-float-topright" data-zoneid={zoneId}></ins>
        <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
          {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
        </Script>
      </div>
    </div>
  );
}
