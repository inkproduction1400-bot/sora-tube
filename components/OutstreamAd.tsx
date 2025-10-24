// components/OutstreamAd.tsx
"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

/**
 * SwipeViewer に差し込む Outstream 広告（デバッグ強化版）
 * - Hooks は無条件で先頭に呼び出し（rules-of-hooks 準拠）
 * - display:block / minHeight を強制して“見えない”問題を回避
 * - 4s ポーリングで iframe 生成を検知 → 無ければ No fill 表示
 */
export default function OutstreamAd({
  minHeight = 220,
  nofillTimeoutMs = 4000,
}: {
  minHeight?: number;
  nofillTimeoutMs?: number;
}) {
  // ★ Hooks はコンポーネント先頭で無条件に呼ぶ
  const domId = useId().replace(/:/g, "_");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [filled, setFilled] = useState<null | boolean>(null); // null=未判定

  // 環境変数の読み出し（ここは Hooks ではないので OK）
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const outClass =
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_CLASS ||
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM;
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM;

  // マウント時のデバッグログ
  useEffect(() => {
    // 1 回だけ
    console.info("[OutstreamAd] mount", {
      enabled,
      outClass,
      zoneId,
      domId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SDK 初期化後に <iframe> が生えたかをポーリング
  useEffect(() => {
    if (!enabled || !zoneId || !outClass) return;

    let tries = 0;
    let stop = false;

    const check = () => {
      if (stop) return;
      tries++;
      const root = wrapRef.current;
      const iframe = root?.querySelector("iframe, ins iframe") as
        | HTMLIFrameElement
        | null;

      if (iframe) {
        setFilled(true);
        return;
      }
      if (tries * 200 >= nofillTimeoutMs) {
        setFilled(false);
        return;
      }
      setTimeout(check, 200);
    };

    // SDK onLoad 直後だけだとタイミングがシビアなので少し遅延して開始
    const t = setTimeout(check, 400);
    return () => {
      clearTimeout(t);
      stop = true;
    };
  }, [enabled, zoneId, outClass, nofillTimeoutMs]);

  // ---- ここから描画分岐（Hooks の後）----
  if (!enabled || !zoneId || !outClass) {
    return null;
  }

  return (
    <div
      ref={wrapRef}
      className="mx-auto flex w-full max-w-[560px] items-center justify-center rounded-2xl bg-black/80"
      style={{ minHeight, position: "relative", zIndex: 1 }}
      data-qa="outstream-ad"
    >
      {/* SDK */}
      <Script
        id={`magsrv-sdk-${domId}`}
        src="https://a.magsrv.com/ad-provider.js"
        strategy="afterInteractive"
        onLoad={() => {
          setSdkLoaded(true);
          console.info("[OutstreamAd] SDK loaded");
        }}
      />

      {/* ゾーンタグ（確実に表示交渉できるよう block/width/minHeight） */}
      <div id={domId} className="w-full">
        <ins
          className={outClass}
          data-zoneid={zoneId}
          style={{ display: "block", width: "100%", minHeight }}
        />
      </div>

      {/* 初期化 */}
      <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
        {`
          try {
            window.AdProvider = window.AdProvider || [];
            window.AdProvider.push({ serve: {} });
            console.info("[OutstreamAd] AdProvider.push(serve) called");
          } catch (e) {
            console.error("[OutstreamAd] init error:", e);
          }
        `}
      </Script>

      {/* デバッグ用オーバーレイ（ノーフィル時） */}
      {sdkLoaded && filled === false && (
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-xs text-white/70">
          <div className="rounded-md border border-white/20 bg-white/5 px-3 py-2">
            No fill (zone:{zoneId})
          </div>
        </div>
      )}
    </div>
  );
}
