// components/OutstreamAd.tsx
"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

export default function OutstreamAd() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";

  // ← ここで「どの名前でも拾う」ように統一
  const outClass =
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_CLASS ||
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM ||
    process.env.NEXT_PUBLIC_EXO_OUT_CLASS || // 旧命名の保険
    "";

  const zoneId =
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM ||
    process.env.NEXT_PUBLIC_EXO_OUT_ZONE_ID || // 旧命名の保険
    "";

  const domId = useId().replace(/:/g, "_");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 5秒後に“<ins>が存在するか/高さが出ているか”をチェック
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      const host = document.getElementById(domId);
      const ins = host?.querySelector("ins");
      const h = host?.getBoundingClientRect().height ?? 0;
      // デバッグログ
      // eslint-disable-next-line no-console
      console.log("[OutstreamAd] enabled=%s class=%s zone=%s ins=%s height=%s",
        enabled, outClass, zoneId, !!ins, h);
      if (!ins) {
        host?.setAttribute("data-ad-debug", "no-ins");
        host?.classList.add("ring-2", "ring-red-500");
      } else if (h < 12) {
        host?.setAttribute("data-ad-debug", "no-fill");
        host?.classList.add("ring-2", "ring-yellow-500");
      }
    }, 5000);
    return () => clearTimeout(t);
  }, [mounted, domId, enabled, outClass, zoneId]);

  if (!enabled || !outClass || !zoneId) return null;

  return (
    <div className="mx-auto flex h-[90vh] w-full items-center justify-center rounded-2xl bg-black/80">
      <div id={domId} className="w-[360px] max-w-[92vw]">
        <Script id={`magsrv-sdk-${domId}`} src="https://a.magsrv.com/ad-provider.js" strategy="afterInteractive" />
        <ins className={outClass} data-zoneid={zoneId}></ins>
        <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
          {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
        </Script>
      </div>
    </div>
  );
}
