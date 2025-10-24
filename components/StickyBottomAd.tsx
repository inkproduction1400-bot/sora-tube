// components/StickyBottomAd.tsx
"use client";

import Script from "next/script";
import { useId } from "react";
import { usePathname } from "next/navigation";

export default function StickyBottomAd() {
  const pathname = usePathname();
  const domId = useId().replace(/:/g, "_");

  // ON/OFF
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";

  // バナー用（通常バナーを固定表示）
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_OUT_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_ZONE_ID_BOTTOM ||
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM;

  const cls =
    process.env.NEXT_PUBLIC_EXO_OUT_CLASS ||
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM ||
    process.env.NEXT_PUBLIC_EXO_CLASS_STICKY;

  // プレイヤー画面では非表示
  if (pathname?.startsWith("/watch")) return null;
  if (!enabled || !zoneId || !cls) return null;

  return (
    <div
      aria-label="sticky-bottom-ad"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center"
      // 余計な overflow/rounded を入れない
    >
      <div id={domId} className="pointer-events-auto">
        {/* SDK */}
        <Script
          id={`magsrv-sdk-${domId}`}
          src="https://a.magsrv.com/ad-provider.js"
          strategy="afterInteractive"
        />
        {/* Zone */}
        <ins className={cls} data-zoneid={zoneId} />
        {/* Init */}
        <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
          {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
        </Script>
      </div>
    </div>
  );
}
