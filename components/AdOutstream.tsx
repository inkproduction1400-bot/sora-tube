"use client";

import Script from "next/script";

export default function AdOutstream() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const zoneId = process.env.NEXT_PUBLIC_EXO_OUT_ZONE_ID;
  const cls = process.env.NEXT_PUBLIC_EXO_OUT_CLASS;

  if (!enabled || !zoneId || !cls) {
    return (
      <div className="flex h-[90vh] items-center justify-center rounded-2xl bg-white/5 text-sm opacity-60">
        広告（準備中）
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] items-center justify-center rounded-2xl bg-black/80">
      <div className="w-[320px] max-w-[90vw]">
        {/* SDK */}
        <Script
          id="magsrv-sdk-outstream"
          src="https://a.magsrv.com/ad-provider.js"
          strategy="afterInteractive"
        />
        {/* ゾーンの ins（ExoClickが出す class をそのまま使用） */}
        <ins className={cls!} data-zoneid={zoneId!}></ins>
        {/* 初期化 */}
        <Script id="magsrv-init-outstream" strategy="afterInteractive">
          {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
        </Script>
      </div>
    </div>
  );
}
