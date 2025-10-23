/* eslint-disable @next/next/no-img-element */
"use client";

import Script from "next/script";
import { useEffect, useState, useId } from "react";

export default function FixedBottomAd() {
  // 環境変数（この2つは“固定下バナー用ゾーン”のタグからコピペ）
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const zoneId = process.env.NEXT_PUBLIC_EXO_ZONE_ID_BOTTOM;         // 例: "5760xxx"
  const insClass = process.env.NEXT_PUBLIC_EXO_INS_CLASS_BOTTOM;     // 例: "eas6a97xxxxxx"

  const [hide, setHide] = useState(false);
  const domId = useId().replace(/:/g, "_");

  if (!enabled || !zoneId || !insClass || hide) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center
                 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="relative mx-auto w-full max-w-[360px] rounded-t-xl bg-black/80 p-2 backdrop-blur">
        {/* 閉じるボタン（任意） */}
        <button
          type="button"
          aria-label="広告を閉じる"
          className="absolute right-1.5 top-1.5 rounded bg-white/10 px-2 py-0.5 text-xs"
          onClick={() => setHide(true)}
        >
          ✕
        </button>

        {/* Exo/MagSrv 非同期タグ */}
        <div id={domId} className="flex w-full justify-center">
          <Script id={`magsrv-sdk-bottom-${domId}`} src="https://a.magsrv.com/ad-provider.js" strategy="afterInteractive" />
          <ins className={insClass} data-zoneid={zoneId}></ins>
          <Script id={`magsrv-init-bottom-${domId}`} strategy="afterInteractive">
            {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
          </Script>
        </div>
      </div>
    </div>
  );
}
