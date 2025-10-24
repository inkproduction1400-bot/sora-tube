// components/OutstreamAd.tsx
"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

/**
 * SwipeViewer 内に 1枠ずつ差し込む Outstream 広告
 * - 可視域手前で SDK/タグを初期化（無駄ロードを防止）
 * - aspectRatio で高さを確保（CLS対策）
 * - nofill 時は自動で折りたたみ
 */
export default function OutstreamAd({
  rootMargin = "200px",
  aspectRatio = "16 / 9",
  reserveMinPx, // 例: 180（未指定なら aspectRatio に任せる）
  nofillTimeoutMs = 4000,
}: {
  rootMargin?: string;
  aspectRatio?: string;
  reserveMinPx?: number;
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

  const [shouldMount, setShouldMount] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // 1) ビューポート直前で初期化
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let done = false;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!done && e?.isIntersecting) {
          done = true;
          setShouldMount(true);
          io.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  // 2) ノーフィル検知 → 自動で畳む
  useEffect(() => {
    if (!shouldMount || !wrapRef.current) return;
    const el = wrapRef.current;

    const t = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const hasChild = el.childElementCount > 0;
      if (!hasChild || rect.height < 12) {
        setCollapsed(true);
      }
    }, nofillTimeoutMs);

    return () => clearTimeout(t);
  }, [shouldMount, nofillTimeoutMs]);

  if (!enabled || !zoneId || !outClass || collapsed) return null;

  // 高さ予約（CLS対策）
  const style: React.CSSProperties =
    reserveMinPx && reserveMinPx > 0
      ? { minHeight: reserveMinPx, position: "relative" }
      : { aspectRatio, position: "relative" };

  return (
    <div
      ref={wrapRef}
      className="mx-auto flex h-full w-full items-center justify-center rounded-2xl bg-black/80"
      style={style}
      aria-label="outstream-in-player"
    >
      {shouldMount ? (
        <div id={domId} className="w-[360px] max-w-[92vw]">
          {/* SDK */}
          <Script
            id={`magsrv-sdk-${domId}`}
            src="https://a.magsrv.com/ad-provider.js"
            strategy="afterInteractive"
          />
          {/* ゾーンタグ */}
          <ins className={outClass} data-zoneid={zoneId}></ins>
          {/* 初期化 */}
          <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
            {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
          </Script>
        </div>
      ) : (
        <div className="h-full w-full rounded-2xl bg-white/5" />
      )}
    </div>
  );
}
