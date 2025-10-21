// components/VerticalSwipePlayer.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type TouchEventHandler } from "react";
import AdSlot from "@/components/AdSlot";

type V = {
  id: string;
  title: string;
  fileUrl: string;
  thumbUrl?: string;
  durationSec?: number;
  category?: string;
};

type AdItem = { __ad: true; key: string };
type Item = V | AdItem;
const isAdItem = (x: Item): x is AdItem => (x as AdItem).__ad === true;

export default function VerticalSwipePlayer({
  videos,
  startIndex = 0,
}: {
  videos: V[];
  startIndex?: number;
}) {
  const adEnabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const freq = Math.max(2, Number(process.env.NEXT_PUBLIC_EXO_FREQUENCY || "4"));

  const merged: Item[] = useMemo(() => {
    if (!adEnabled) return videos;
    const out: Item[] = [];
    videos.forEach((v, idx) => {
      if (idx > 0 && idx % freq === 0) out.push({ __ad: true, key: `ad-${idx}` });
      out.push(v);
    });
    return out;
  }, [videos, adEnabled, freq]);

  const startMergedIndex = useMemo(() => {
    if (!adEnabled) return Math.max(0, Math.min(videos.length - 1, startIndex));
    const clamped = Math.max(0, Math.min(videos.length - 1, startIndex));
    const adCountBefore = Math.floor(clamped / freq);
    return Math.max(0, Math.min(merged.length - 1, clamped + adCountBefore));
  }, [startIndex, videos.length, adEnabled, freq, merged.length]);

  const [i, setI] = useState<number>(startMergedIndex);
  const cur: Item | undefined = merged[i];
  const isAd = !!cur && isAdItem(cur);

  // ====== 再生制御（ミュートは状態管理） ======
  const vref = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    setIsMuted(true);
    setReady(false);
    if (isAd) return;
    const v = vref.current;
    if (!v) return;
    try { v.pause(); } catch {}
    v.currentTime = 0;
    v.muted = true;
    void v.play().catch(() => {});
  }, [i, isAd]);

  useEffect(() => {
    if (isAd) return;
    const v = vref.current; if (!v) return;
    v.muted = isMuted;
    if (!isMuted && ready) {
      void v.play().catch(() => {});
    }
  }, [isMuted, ready, isAd]);

  // ====== スワイプ系 ======
  const startY = useRef<number>(0);
  const lastDy = useRef<number>(0);
  const moved = useRef<boolean>(false);
  const THRESHOLD = 60;

  const [offsetY, setOffsetY] = useState<number>(0);
  const [withTransition, setWithTransition] = useState<boolean>(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const onTouchStart: TouchEventHandler<HTMLDivElement> = (e) => {
    startY.current = e.touches[0].clientY;
    lastDy.current = 0;
    moved.current = false;
    setWithTransition(false);
  };

  const onTouchMove: TouchEventHandler<HTMLDivElement> = (e) => {
    const dy = e.touches[0].clientY - startY.current;
    lastDy.current = dy;
    if (!moved.current && Math.abs(dy) > 2) moved.current = true;

    const atTop = i === 0;
    const atBottom = i === merged.length - 1;

    if ((atTop && dy > 0) || (atBottom && dy < 0)) {
      const eased = Math.max(-80, Math.min(80, dy * 0.35));
      setOffsetY(eased);
    } else {
      setOffsetY(0);
    }
  };

  const onTouchEnd: TouchEventHandler<HTMLDivElement> = () => {
    const dy = lastDy.current;
    const atTop = i === 0;
    theEnd:
    {
      const atBottom = i === merged.length - 1;

      if ((atTop && dy > 0) || (atBottom && dy < 0)) {
        setWithTransition(true);
        const bump = dy > 0 ? 22 : -22;
        setOffsetY(bump);
        window.setTimeout(() => setOffsetY(0), 140);
        break theEnd;
      }

      if (Math.abs(dy) >= THRESHOLD) {
        if (dy < 0 && i < merged.length - 1) setI(i + 1);
        if (dy > 0 && i > 0) setI(i - 1);
      }
    }

    setWithTransition(true);
    setOffsetY(0);
  };

  // ★ Hooks を早期 return より前に配置（ルール対応）
  const videoOrdinal = useMemo(() => {
    let count = 0;
    for (let k = 0; k <= i; k++) if (!isAdItem(merged[k])) count++;
    return count;
  }, [i, merged]);
  const totalVideos = videos.length;

  if (!cur) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black text-white">
        動画がありません
      </div>
    );
  }

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-black text-white touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Link
        href="/"
        className="fixed right-3 top-3 z-20 rounded-full bg-white/15 px-3 py-1 text-sm hover:bg-white/25"
      >
        TOPへ戻る
      </Link>

      <div
        className="pointer-events-none fixed right-2 top-1/2 z-10 -translate-y-1/2 opacity-70"
        style={{ writingMode: "vertical-rl" }}
      >
        <span className="rounded bg-white/10 px-1 py-1 text-[12px] tracking-widest">
          上下にスワイプ
        </span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={[
            "relative aspect-[9/16] h-[90vh] max-h-[90vh] overflow-hidden rounded-2xl bg-black",
            "will-change-transform",
            withTransition ? "transition-transform duration-150" : "",
          ].join(" ")}
          style={{ transform: `translateY(${offsetY}px)` }}
        >
          {isAdItem(cur) ? (
            <AdSlot />
          ) : (
            <>
              <video
                key={cur.id}
                ref={vref}
                src={cur.fileUrl}
                className="h-full w-full object-cover"
                playsInline
                autoPlay
                preload="auto"
                loop
                controls={false}
                muted={isMuted}
                onLoadedData={() => setReady(true)}
              />
              {isMuted && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMuted(false);
                    void vref.current?.play().catch(() => {});
                  }}
                  className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1 text-sm"
                >
                  🔊 タップで音声ON
                </button>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="line-clamp-2 text-sm font-semibold">{cur.title}</div>
                {cur.category && <div className="mt-1 text-xs opacity-80">#{cur.category}</div>}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-3 left-1/2 z-20 -translate-x-1/2 text-xs opacity-70">
        {videoOrdinal} / {totalVideos}
      </div>
    </div>
  );
}
