"use client";

import Script from "next/script";
import { useId } from "react";

/**
 * ExoClick Outstream Video（独立プレイヤー形式）
 * 自動再生のインプレッション型動画広告
 */
export default function OutstreamAd() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";

  // どちらの環境変数名でも拾えるように
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM ||
    process.env.NEXT_PUBLIC_EXO_OUT_ZONE_ID;

  const outClass =
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM ||
    process.env.NEXT_PUBLIC_EXO_OUT_CLASS ||
    "eas6a97888e37"; // Exoの画面で表示されている class

  const domId = useId().replace(/:/g, "_");

  if (!enabled || !zoneId) return null;

  return (
    <div className="relative flex items-center justify-center py-6">
      {/* 1) ライブラリ */}
      <Script
        id={`magsrv-sdk-${domId}`}
        src="https://a.magsrv.com/ad-provider.js"
        strategy="afterInteractive"
      />
      {/* 2) ゾーン本体 */}
      <ins
        className={outClass}
        data-zoneid={zoneId}
        style={{ display: "block", width: "100%", maxWidth: 640 }}
      />
      {/* 3) 初期化 */}
      <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
        {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
      </Script>
    </div>
  );
}
