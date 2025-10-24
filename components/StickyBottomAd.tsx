// components/StickyBottomAd.tsx
"use client";

import Script from "next/script";
import { useId } from "react";
import { usePathname } from "next/navigation";

export default function StickyBottomAd() {
  const pathname = usePathname();
  const domId = useId().replace(/:/g, "_");

  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const cls =
    process.env.NEXT_PUBLIC_EXO_CLASS_STICKY ||
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM || // 予備
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_CLASS || // 予備
    process.env.NEXT_PUBLIC_EXO_OUT_CLASS ||       // 旧
    "";
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_ZONE_ID_BOTTOM ||
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM ||  // 予備
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_ZONE_ID || // 予備
    process.env.NEXT_PUBLIC_EXO_OUT_ZONE_ID ||     // 旧
    "";

  // /watch は非表示
  if (pathname?.startsWith("/watch")) return null;
  if (!enabled || !cls || !zoneId) return null;

  // eslint-disable-next-line no-console
  console.log("[StickyBottomAd] enabled=%s class=%s zone=%s", enabled, cls, zoneId);

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-2">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black/70 backdrop-blur">
        <div id={domId} className="mx-auto w-[320px] max-w-[92vw]">
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
