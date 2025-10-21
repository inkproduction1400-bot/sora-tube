"use client";

import Script from "next/script";
import { useEffect, useId } from "react";

export default function AdSlot() {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const zoneId = process.env.NEXT_PUBLIC_EXO_ZONE_ID;
  const domId = useId().replace(/:/g, "_");

  useEffect(() => {
    if (!enabled || !zoneId) return;
    // ExoClickは挿入用のwindow関数があるパターンとiframeタグ直置きの2系統。
    // ここではscriptタグ→divへの描画（一般的な設置方法）を想定。
    // ゾーンの具体タグは発行画面に準拠でOK。
  }, [enabled, zoneId]);

  if (!enabled || !zoneId) {
    return (
      <div className="flex h-[90vh] items-center justify-center rounded-2xl bg-white/5 text-sm opacity-60">
        広告（準備中）
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] items-center justify-center rounded-2xl bg-black/80">
      {/* ここにExoClickの発行タグを入れる。例として script + ins を配置 */}
      <div id={domId} className="w-[320px] max-w-[90vw]">
        <Script
          id={`exo-sdk-${domId}`}
          src="https://a.exoclick.com/tag.php"
          strategy="afterInteractive"
        />
        {/* ↓ゾーンタグは管理画面の指示に合わせてください。例（ダミー）： */}
        <ins data-zoneid={zoneId} data-sub="%pageviewid%"></ins>
        <Script id={`exo-init-${domId}`} strategy="afterInteractive">
          {`try{(window['ExoLoader']=window['ExoLoader']||[]).push({});}catch(e){}`}
        </Script>
      </div>
    </div>
  );
}
