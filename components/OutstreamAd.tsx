"use client";
import Script from "next/script";
import { useId } from "react";

export default function OutstreamAd() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM ||
    process.env.NEXT_PUBLIC_EXO_OUT_ZONE_ID; // どちらでも拾う
  const outClass =
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM ||
    process.env.NEXT_PUBLIC_EXO_OUT_CLASS ||
    "eas6a97888e37";
  const domId = useId().replace(/:/g, "_");

  if (!enabled || !zoneId) return null;

  return (
    <div className="relative flex items-center justify-center py-6">
      {/* SDK（重複読込OK、NextのScriptは一意idで制御） */}
      <Script
        id="magsrv-sdk-global"
        src="https://a.magsrv.com/ad-provider.js"
        strategy="afterInteractive"
      />
      {/* ゾーン本体（十分な可視領域を確保） */}
      <ins
        className={outClass}
        data-zoneid={zoneId}
        style={{
          display: "block",
          width: "100%",
          maxWidth: 640,
          minHeight: 250, // ← viewability/no-fill対策
        }}
      />
      {/* 初期化キュー：SDK未読でも配列pushされ、後で処理される */}
      <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
        {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
      </Script>
    </div>
  );
}
