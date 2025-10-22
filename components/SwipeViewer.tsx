// components/SwipeViewer.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type TouchEventHandler } from "react";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";

type V = {
  id: string;
  title: string;
  fileUrl: string;
  thumbUrl?: string;
  durationSec?: number;
  category?: string;
};

// 広告アイテム
type AdItem = { __ad: true; key: string };
type Item = V | AdItem;
const isAdItem = (x: Item): x is AdItem => (x as AdItem).__ad === true;

export default function SwipeViewer({
  videos,
  initialId,
}: {
  videos: V[];
  initialId?: string;
}) {
  // --- 広告の有効化と頻度 ---
  const adEnabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const freq = Math.max(2, Number(process.env.NEXT_PUBLIC_EXO_FREQUENCY || "3"));

  // 広告を差し込んだ配列を作成
  const merged: Item[] = useMemo(() => {
    if (!adEnabled) return videos;
    const out: Item[] = [];
    videos.forEach((v, idx) => {
      if (idx > 0 && idx % freq === 0) out.push({ __ad: true, key: `ad-${idx}` });
      out.push(v);
    });
    return out;
  }, [videos, adEnabled, freq]);

  // initialId を merged のインデックスへ変換
  const startMergedIndex = useMemo(() => {
    const pureIdx = (() => {
      if (!initialId) return 0;
      const i = videos.findIndex((v) => v.id === initialId);
      return i >= 0 ? i : 0;
    })();
    if (!adEnabled) return pureIdx;
    const adCountBefore = Math.floor(pureIdx / freq);
    return Math.max(0, Math.min(merged.length - 1, pureIdx + adCountBefore));
  }, [initialId, videos, adEnabled, freq, merged.length]);

  const [idx, setIdx] = useState(startMergedIndex);
  const curr = merged[idx];
  const isAd = !!curr && isAdItem(curr);

  const [bounce, setBounce] = useState<"top" | "bottom" | null>(null);

  // タッチ/スワイプ
  const touchStartY = useRef<number | null>(null);
  const THRESH = 40;

  const toPrev = () => {
    if (idx > 0) setIdx(idx - 1);
    else bounceOnce("top");
  };
  const toNext = () => {
    if (idx < merged.length - 1) setIdx(idx + 1);
    else bounceOnce("bottom");
  };
  const bounceOnce = (where: "top" | "bottom") => {
    setBounce(where);
    setTimeout(() => setBounce(null), 180);
  };

  const onTouchStart: TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd: TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > THRESH) {
      if (dy > 0) toPrev();
      else toNext();
    }
    touchStartY.current = null;
  };

  // マウスホイール・キーボード
  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (e.deltaY > 10) toNext();
    else if (e.deltaY < -10) toPrev();
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") toPrev();
      if (e.key === "ArrowDown" || e.key === " ") toNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, merged.length]);

  // 再生コントロール
  const vref = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  // インデックス変更時：ミュートに戻して準備し直す（広告行では動画処理なし）
  useEffect(() => {
    setMuted(true);
    setReady(false);
  }, [idx]);

  // 動画ソースやミュート状態が変わったら再生
  useEffect(() => {
    if (isAd) return;
    const v = vref.current;
    if (!v) return;
    v.muted = muted;
    v.play().catch(() => {});
  }, [idx, (curr as V | undefined)?.fileUrl, muted, isAd]);

  if (!curr) {
    return (
      <main className="grid h-[100dvh] place-content-center bg-black text-white">
        このカテゴリには動画がありません
      </main>
    );
  }

  // 広告を除いた“何本目/全体”インジケータ
  const videoOrdinal = useMemo(() => {
    let count = 0;
    for (let k = 0; k <= idx; k++) {
      if (!isAdItem(merged[k])) count++;
    }
    return count;
  }, [idx, merged]);
  const totalVideos = videos.length;

  return (
    <main
      className="relative h-[100dvh] w-full overflow-hidden bg-black text-white"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      {/* TOPへ戻る */}
      <div className="pointer-events-auto fixed right-3 top-3 z-20">
        <Link
          href="/"
          className="rounded-xl bg-white/15 px-3 py-1 text-sm backdrop-blur hover:bg-white/25"
        >
          TOPへ戻る
        </Link>
      </div>

      {/* 右側縦書きのヒント */}
      <div
        className="pointer-events-none fixed right-1 top-1/2 z-10 -translate-y-1/2 opacity-60"
        style={{ writingMode: "vertical-rl" }}
      >
        上下にスワイプ
      </div>

      {/* コンテンツ（軽いバウンス） */}
      <div
        className={[
          "absolute inset-0 flex items-center justify-center transition-transform duration-150",
          bounce === "top" ? "-translate-y-2" : "",
          bounce === "bottom" ? "translate-y-2" : "",
        ].join(" ")}
      >
        <div className="mx-auto h-full w-full max-w-[560px]">
          <div className="relative h-full w-full">
            {isAdItem(curr) ? (
              <AdSlot />
            ) : (
              <>
                <video
                  key={(curr as V).id}
                  ref={vref}
                  src={(curr as V).fileUrl}
                  poster={(curr as V).thumbUrl}
                  className="h-full w-full object-contain"
                  playsInline
                  autoPlay
                  preload="auto"
                  muted={muted}
                  onLoadedData={() => setReady(true)}
                />
                {/* タイトル */}
                <div className="absolute bottom-3 left-3 right-3 line-clamp-2 rounded-lg bg-black/35 p-2 text-sm">
                  {(curr as V).title}
                </div>

                {/* 音声ONボタン */}
                {muted && (
                  <button
                    onClick={() => {
                      setMuted(false);
                      vref.current?.play().catch(() => {});
                    }}
                    className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1 text-sm"
                  >
                    🔊 タップで音声ON
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* インジケータ（広告を除いたカウント） */}
      <div className="fixed bottom-3 left-1/2 z-20 -translate-x-1/2 text-xs opacity-70">
        {videoOrdinal} / {totalVideos}
      </div>
    </main>
  );
}
