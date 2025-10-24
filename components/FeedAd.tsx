// components/FeedAd.tsx
"use client";

import Script from "next/script";
import { useEffect, useId, useMemo, useRef, useState } from "react";

type Props = {
  id?: string;
  className?: string;
  /** 可視域手前でロード開始する余白（例: '200px'） */
  rootMargin?: string;
  /** CLS対策の高さ予約（例: '16 / 9'） */
  aspectRatio?: string;
  /** ノーフィル時に自動で畳むまでの猶予(ms) */
  nofillTimeoutMs?: number;
  /** ★ 予約する最小高さ(px)。stickyと同じ考え方で上書き可 */
  reserveMinPx?: number;
};

export default function FeedAd({
  id,
  className,
  rootMargin = "200px",
  aspectRatio = "16 / 9",
  nofillTimeoutMs = 4000,
  reserveMinPx,
}: Props) {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";

  const outClass =
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_CLASS ||
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM;

  const zoneId =
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM ||
    process.env.NEXT_PUBLIC_EXO_OUT_ZONE_ID; // 互換

  const domId = useId().replace(/:/g, "_");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [shouldMount, setShouldMount] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // ★ ENVの予備値（Feedでも横長バナーを入れるケースに備えて）
  const envReserveMin = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_EXO_FEED_MIN || process.env.NEXT_PUBLIC_EXO_RESERVE_MIN;
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, []);
  const minH = reserveMinPx ?? envReserveMin; // 明示指定優先

  // ビューポート直前でロード開始（Lazy）
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

  // ノーフィル検知 → 折りたたみ
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

  const wrapClass = ["w-full", className].filter(Boolean).join(" ");

  return (
    <div
      ref={wrapRef}
      className={wrapClass}
      style={{
        aspectRatio,
        position: "relative",
        ...(minH ? { minHeight: minH } : null),
      }}
      aria-label="in-feed-ad"
      data-ad-id={id}
    >
      {shouldMount ? (
        <div className="mx-auto flex h-full w-full items-center justify-center rounded-2xl bg-black/80">
          <div id={domId} className="w-[360px] max-w-[92vw]">
            <Script
              id={`magsrv-sdk-${domId}`}
              src="https://a.magsrv.com/ad-provider.js"
              strategy="afterInteractive"
            />
            <ins className={outClass} data-zoneid={zoneId}></ins>
            <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
              {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
            </Script>
          </div>
        </div>
      ) : (
        <div className="h-full w-full rounded-2xl bg-white/5" />
      )}
    </div>
  );
}
