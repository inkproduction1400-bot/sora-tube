// components/FeedAd.tsx
"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  id?: string;
  className?: string;
  /** 可視域手前でロード開始する余白（例: '200px'） */
  rootMargin?: string;
  /** CLS対策の高さ予約（例: '16 / 9'） */
  aspectRatio?: string;
  /** ノーフィル時に自動で畳むまでの猶予(ms) */
  nofillTimeoutMs?: number;
};

export default function FeedAd({
  id,
  className,
  rootMargin = "200px",
  aspectRatio = "16 / 9",
  nofillTimeoutMs = 4000,
}: Props) {
  const enabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";

  // ▼ Outstream 用ゾーン（ExoClick/MagSrv 管理画面の Asynchronous Script にある class と zone id）
  const outClass =
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_CLASS ||
    process.env.NEXT_PUBLIC_EXO_CLASS_OUTSTREAM; // 互換
  const zoneId =
    process.env.NEXT_PUBLIC_EXO_OUTSTREAM_ZONE_ID ||
    process.env.NEXT_PUBLIC_EXO_ZONE_OUTSTREAM; // 互換

  const domId = useId().replace(/:/g, "_");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [shouldMount, setShouldMount] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  // ノーフィル検知 → 折りたたみ（空白を作らない）
  useEffect(() => {
    if (!shouldMount || !wrapRef.current) return;
    const el = wrapRef.current;

    const t = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const hasChild = el.childElementCount > 0;
      // 子要素がいない or 高さが付かない場合はノーフィル扱い
      if (!hasChild || rect.height < 12) {
        setCollapsed(true);
      }
    }, nofillTimeoutMs);

    return () => clearTimeout(t);
  }, [shouldMount, nofillTimeoutMs]);

  // 非表示条件
  if (!enabled || !zoneId || !outClass || collapsed) {
    return null;
  }

  // clsx を使わずシンプル連結
  const wrapClass =
    ["w-full", className].filter(Boolean).join(" ");

  return (
    <div
      ref={wrapRef}
      className={wrapClass}
      style={{ aspectRatio, position: "relative" }}
      aria-label="in-feed-ad"
      data-ad-id={id}
    >
      {/* まだ可視域でなければ Script/タグを出さない（Lazy） */}
      {shouldMount ? (
        <div className="mx-auto flex h-full w-full items-center justify-center rounded-2xl bg-black/80">
          <div id={domId} className="w-[360px] max-w-[92vw]">
            {/* 1) SDK */}
            <Script
              id={`magsrv-sdk-${domId}`}
              src="https://a.magsrv.com/ad-provider.js"
              strategy="afterInteractive"
            />
            {/* 2) ゾーンタグ（class は管理画面の表示通りに） */}
            <ins className={outClass} data-zoneid={zoneId}></ins>
            {/* 3) 初期化 */}
            <Script id={`magsrv-init-${domId}`} strategy="afterInteractive">
              {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
            </Script>
          </div>
        </div>
      ) : (
        // 遅延中のプレースホルダ（CLS対策でスペースは予約済み）
        <div className="h-full w-full rounded-2xl bg-white/5" />
      )}
    </div>
  );
}
