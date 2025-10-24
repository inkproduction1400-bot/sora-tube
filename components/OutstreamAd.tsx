// components/OutstreamAd.tsx
"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

/**
 * SwipeViewer に差し込む Outstream 広告（デバッグ強化版）
 * - まずは “必ずマウント” して SDK / タグを即初期化（Lazyは一旦オフ）
 * - minHeight / z-index / display:block など見え方の落とし穴を回避
 * - 4s ポーリングで <ins> 配下に iframe 生えたか検知 → だめなら "No fill" を明示
 */
export default function OutstreamAd({
  minHeight = 220, // ゾーンが 300x250/320x50 でも最低これくらい確保
  nofillTimeoutMs = 4000,
}: {
  minHeight?: number;
  nofillTimeoutMs?: number;
}) {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const outClass =
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_CLASS ||
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM;
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM;

  const domId = useId().replace(/:/g, "_");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const insRef = useRef<HTMLDivElement | null>(null);

  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [pushed, setPushed] = useState(false);
  const [filled, setFilled] = useState<null | boolean>(null); // null=未判定 / true=表示 / false=ノーフィル

  // 1) 事前ガード
  if (!enabled || !zoneId || !outClass) {
    return null;
  }

  // 2) ノーフィル判定（ins 配下に iframe がいるか）
  useEffect(() => {
    if (!wrapRef.current) return;

    let tries = 0;
    const tick = () => {
      tries++;
      const root = wrapRef.current!;
      const ifr = root.querySelector("iframe, ins iframe") as HTMLIFrameElement | null;
      if (ifr) {
        setFilled(true);
        return;
      }
      if (tries * 200 >= nofillTimeoutMs) {
        setFilled(false);
        return;
      }
      setTimeout(tick, 200);
    };

    // SDK init 後にチェック開始
    const t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [sdkLoaded, pushed, nofillTimeoutMs]);

  // 3) デバッグログ（Vercel /watch で追えるように）
  useEffect(() => {
    // 1 回だけ
    // eslint-disable-next-line no-console
    console.info("[OutstreamAd] mount", {
      outClass,
      zoneId,
      enabled,
      domId,
    });
  }, [outClass, zoneId, enabled, domId]);

  return (
    <div
      ref={wrapRef}
      className="mx-auto flex w-full max-w-[560px] items-center justify-center rounded-2xl bg-black/80"
      style={{
        minHeight,
        position: "relative",
        zIndex: 1,
      }}
      data-qa="outstream-ad"
    >
      {/* SDK */}
      <Script
        id={`magsrv-sdk-${domId}`}
        src="https://a.magsrv.com/ad-provider.js"
        strategy="afterInteractive"
        onLoad={() => {
          setSdkLoaded(true);
          // eslint-disable-next-line no-console
          console.info("[OutstreamAd] SDK loaded");
        }}
      />

      {/* ゾーンタグ：display:block を強制、サイズ交渉しやすく */}
      <div id={domId} ref={insRef} className="w-full">
        <ins
          className={outClass}
          data-zoneid={zoneId}
          style={{
            display: "block",
            width: "100%",
            minHeight,
          }}
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

      {/* ステータス表示（デバッグ時のみ視覚化） */}
      {filled === false && (
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-xs text-white/70">
          <div className="rounded-md border border-white/20 bg-white/5 px-3 py-2">
            No fill (zone:{zoneId})
          </div>
        </div>
      )}
    </div>
  );
}
