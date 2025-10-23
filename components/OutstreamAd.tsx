"use client";

import Script from "next/script";
import { useId } from "react";

/**
 * ExoClick Outstream Video（独立プレイヤー形式）
 * 自動再生型のインプレッション報酬向け動画広告
 */
export default function OutstreamAd() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const zoneId = process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM;
  const domId = useId().replace(/:/g, "_");

  if (!enabled || !zoneId) return null;

  return (
    <div className="relative flex items-center justify-center py-6">
      {/* 1) ライブラリ読み込み */}
      <Script
        id={`magsrv-sdk-${domId}`}
        src="https://a.magsrv.com/ad-provider.js"
        strategy="afterInteractive"
      />
      {/* 2) ゾーン本体 */}
      <ins
        className={process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM || "eas6a97888e37"}
        data-zoneid={zoneId}
        style={{ display: "block", width: "100%", maxWidth: 640 }}
      ></ins>
      {/* 3) 初期化 */}
      <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
        {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
      </Script>
    </div>
  );
}
