// components/StickyBottomAd.tsx
"use client";

import Script from "next/script";
import { useId } from "react";
import { usePathname } from "next/navigation";

export default function StickyBottomAd() {
  // Hooksは常に最上部で無条件に呼ぶ
  const pathname = usePathname();
  const domId = useId().replace(/:/g, "_");

  // 環境変数（すべて公開変数）
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";

  // ゾーンIDとクラスは “OUTSTREAM/STICKY/BANNER” のいずれでも入っていれば拾う
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_ZONE_ID_BOTTOM ||
    process.env.NEXT_PUBLIC_EXO_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM ||
    process.env.NEXT_PUBLIC_EXO_OUT_ZONE_ID;

  const cls =
    process.env.NEXT_PUBLIC_EXO_CLASS_STICKY ||
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM ||
    process.env.NEXT_PUBLIC_EXO_OUT_CLASS ||
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_CLASS ||
    "eas6a97888e17"; // 既定

  // 競合回避: /watch では出さない
  if (pathname?.startsWith("/watch")) return null;
  if (!enabled || !zoneId || !cls) return null;

  // 端末別の“最低確保高” (px) — スティッキーの多くは 50〜100px 程度
  const reserveMin = 90;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[520px] px-3 pb-[max(env(safe-area-inset-bottom),8px)]"
      aria-label="sticky-bottom-ad"
    >
      {/* 角丸や枠は外して純粋に高さを確保（黒い横線だけになるのを避ける） */}
      <div id={domId} className="w-full">
        {/* SDK */}
        <Script
          id={`magsrv-sdk-${domId}`}
          src="https://a.magsrv.com/ad-provider.js"
          strategy="afterInteractive"
        />
        {/* ゾーンタグ本体：高さ予約＆ブロック表示を強制 */}
        <ins
          className={cls}
          data-zoneid={zoneId}
          style={{
            display: "block",
            width: "100%",
            minHeight: `${reserveMin}px`,
            // たまに親の line-height の影響で潰れることがあるため 0 を指定
            lineHeight: 0,
          }}
        />
        {/* 初期化 */}
        <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
          {`(function(){
              try {
                console.log('[StickyBottomAd] init:', {
                  enabled: ${JSON.stringify(enabled)},
                  zoneId: '${zoneId}',
                  cls: '${cls}',
                  domId: '${domId}'
                });
                (window.AdProvider = window.AdProvider || []).push({ serve: {} });
              } catch(e) { console.error('[StickyBottomAd] init error', e); }
            })();`}
        </Script>
      </div>
      {/* 画面下にめり込むのを防ぐ透明スペーサ（安全域） */}
      <div style={{ height: 0, paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }} />
    </div>
  );
}
