// components/StickyBottomAd.tsx
"use client";

import { useEffect, useId } from "react";

export default function StickyBottomAd() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  // 固定バナー用に別ゾーンを使うのがベター（無ければ通常ゾーンを利用）
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_ZONE_ID_BOTTOM ||
    process.env.NEXT_PUBLIC_EXO_ZONE_ID;

  // ExoClick 管理画面の「class」指定（必要なら .env で差し替え）
  const zoneClass =
    process.env.NEXT_PUBLIC_EXO_CLASS_BANNER || "eas6a97888e2";

  const domId = useId().replace(/:/g, "_");

  useEffect(() => {
    if (!enabled || !zoneId) return;
    // SDK は layout.tsx で 1 回だけ読み込んでいる前提
    try {
      (window as any).AdProvider = (window as any).AdProvider || [];
      (window as any).AdProvider.push({ serve: {} });
    } catch {
      /* noop */
    }
  }, [enabled, zoneId]);

  if (!enabled || !zoneId) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-2">
      <div className="rounded-lg bg-black/70 px-2 py-2 backdrop-blur">
        <div id={domId} className="w-[320px] max-w-[92vw]">
          {/* 管理画面「Asynchronous Script（Recommended）」に合わせた ins だけを配置 */}
          <ins className={zoneClass} data-zoneid={zoneId}></ins>
        </div>
      </div>
    </div>
  );
}
