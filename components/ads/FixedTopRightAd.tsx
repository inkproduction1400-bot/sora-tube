"use client";

import Script from "next/script";
import { useEffect, useState, useId } from "react";

export default function FixedTopRightAd() {
  // 環境変数（“右上固定バナー用ゾーン”のタグからコピペ）
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const zoneId = process.env.NEXT_PUBLIC_EXO_ZONE_ID_TOPRIGHT;        // 例: "5761xxx"
  const insClass = process.env.NEXT_PUBLIC_EXO_INS_CLASS_TOPRIGHT;    // 例: "eas7b12xxxxx"

  const [hide, setHide] = useState(false);
  const domId = useId().replace(/:/g, "_");

  if (!enabled || !zoneId || !insClass || hide) return null;

  return (
    <div className="pointer-events-none fixed right-2 top-2 z-50">
      <div className="pointer-events-auto relative rounded-xl bg-black/80 p-2 backdrop-blur">
        <button
          type="button"
          aria-label="広告を閉じる"
          className="absolute right-1 top-1 rounded bg-white/10 px-2 py-0.5 text-xs"
          onClick={() => setHide(true)}
        >
          ✕
        </button>

        <div id={domId} className="flex w-[320px] max-w-[90vw] justify-center">
          <Script id={`magsrv-sdk-tr-${domId}`} src="https://a.magsrv.com/ad-provider.js" strategy="afterInteractive" />
          <ins className={insClass} data-zoneid={zoneId}></ins>
          <Script id={`magsrv-init-tr-${domId}`} strategy="afterInteractive">
            {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
          </Script>
        </div>
      </div>
    </div>
  );
}
