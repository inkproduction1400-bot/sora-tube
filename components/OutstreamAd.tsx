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
    process.env.NEXT_PUBLIC_EXO_OUT_CLASS || "eas6a97888e37";
  const domId = useId().replace(/:/g, "_");

  if (!enabled || !zoneId) return null;

  return (
    <div className="relative flex items-center justify-center py-6">
      {/* SDKはlayoutで一度だけ読む。ここは<ins>とpushだけ */}
      <ins
        className={outClass}
        data-zoneid={zoneId}
        style={{ display: "block", width: "100%", maxWidth: 640 }}
      />
      <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
        {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
      </Script>
    </div>
  );
}
