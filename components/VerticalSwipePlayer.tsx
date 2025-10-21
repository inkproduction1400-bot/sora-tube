// components/VerticalSwipePlayer.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AdSlot from "@/components/AdSlot";

type V = {
  id: string;
  title: string;
  fileUrl: string;
  thumbUrl?: string;
  durationSec?: number;
  category?: string;
};

// 内部配列の要素型：動画 or 広告スロット
type Item = V | { __ad: true; key: string };

export default function VerticalSwipePlayer({
  videos,
  startIndex = 0,
}: {
  videos: V[];
  startIndex?: number;
}) {
  // --- 広告挿入の設定（.env で制御） ---
  const adEnabled = process.env.NEXT_PUBLIC_AD_ENABLED === "true";
  const freq = Math.max(2, Number(process.env.NEXT_PUBLIC_EXO_FREQUENCY || "4")); // N本ごとに1枠

  // 動画配列に広告スロットを挟み込んだ merged を作成
  const merged: Item[] = useMemo(() => {
    if (!adEnabled) return videos;
    const out: Item[] = [];
    videos.forEach((v, idx) => {
      if (idx > 0 && idx % freq === 0) out.push({ __ad: true, key: `ad-${idx}` });
      out.push(v);
    });
    return out;
  }, [videos, adEnabled, freq]);

  // startIndex は「動画配列」のインデックス基準なので、merged 側のインデックスに変換
  const startMergedIndex = useMemo(() => {
    if (!adEnabled) return Math.max(0, Math.min(videos.length - 1, startIndex));
    const clamped = Math.max(0, Math.min(videos.length - 1, startIndex));
    const adCountBefore = Math.floor(clamped / freq); // その位置までに入る広告数
    return Math.max(0, Math.min(merged.length - 1, clamped + adCountBefore));
  }, [startIndex, videos.length, adEnabled, freq, merged.length]);

  const [i, setI] = useState(startMergedIndex);
  const cur = merged[i];
  const isAd = (cur as any)?.__ad === true;

  // ====== 再生制御（ミュートは状態管理） ======
  const vref = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [ready, setReady] = useState(false);

  // 動画切替時：位置/状態リセット & ミュートで自動再生（広告行ではスキップ）
  useEffect(() => {
    setIsMuted(true);
    setReady(false);
    if (isAd) return;
    const v = vref.current;
    if (!v) return;
    try { v.pause(); } catch {}
    v.currentTime = 0;
    v.muted = true;
    v.play().catch(() => {});
  }, [i, isAd]);

  // ミュート状態が変わったら反映。解除直後は play を明示
  useEffect(() => {
    if (isAd) return;
    const v = vref.current; if (!v) return;
    v.muted = isMuted;
    if (!isMuted && ready) {
      v.play().catch(() => {});
    }
  }, [isMuted, ready, isAd]);

  // ====== スワイプ系 ======
  const startY = useRef(0);
  const lastDy = useRef(0);
  const moved = useRef(false);
  const THRESHOLD = 60;

  // バウンス表示用：動画コンテナのYオフセット(px)
  const [offsetY, setOffsetY] = useState(0);
  // アニメーション制御（trueだとtransition適用）
  const [withTransition, setWithTransition] = useState(false);

  // スクロール無効
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    startY.current = e.touches[0].clientY;
    lastDy.current = 0;
    moved.current = false;
    setWithTransition(false); // 追従中はtransitionオフ
  };

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const dy = e.touches[0].clientY - startY.current;
    lastDy.current = dy;
    if (!moved.current && Math.abs(dy) > 2) moved.current = true;

    const atTop = i === 0;
    const atBottom = i === merged.length - 1;

    // エッジでのみ「引っ張り」表現（0.35倍＆上限80px）
    if ((atTop && dy > 0) || (atBottom && dy < 0)) {
      const eased = Math.max(-80, Math.min(80, dy * 0.35));
      setOffsetY(eased);
    } else {
      setOffsetY(0); // 端以外は位置固定
    }
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    const dy = lastDy.current;
    const atTop = i === 0;
    const atBottom = i === merged.length - 1;

    if ((atTop && dy > 0) || (atBottom && dy < 0)) {
      // 端：ページング不可 → バウンス
      setWithTransition(true);
      const bump = dy > 0 ? 22 : -22;
      setOffsetY(bump);
      setTimeout(() => setOffsetY(0), 140);
      return;
    }

    // 通常ページング（広告行も1アイテムとして進む）
    if (Math.abs(dy) >= THRESHOLD) {
      if (dy < 0 && i < merged.length - 1) setI(i + 1); // 次へ
      if (dy > 0 && i > 0) setI(i - 1); // 前へ
    }

    setWithTransition(true);
    setOffsetY(0);
  };

  if (!cur) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black text-white">
        動画がありません
      </div>
    );
  }

  // 進捗インジケータ（動画何本目/全動画本数）を表示：広告はカウントしない
  const videoOrdinal = useMemo(() => {
    let count = 0;
    for (let k = 0; k <= i; k++) {
      if (!(merged[k] as any).__ad) count++;
    }
    return count;
  }, [i, merged]);
  const totalVideos = videos.length;

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-black text-white touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* 右上 TOPへ戻る */}
      <Link
        href="/"
        className="fixed right-3 top-3 z-20 rounded-full bg-white/15 px-3 py-1 text-sm hover:bg-white/25"
      >
        TOPへ戻る
      </Link>

      {/* 縦書きスワイプガイド（右側余白） */}
      <div
        className="pointer-events-none fixed right-2 top-1/2 z-10 -translate-y-1/2 opacity-70"
        style={{ writingMode: "vertical-rl" }}
      >
        <span className="rounded bg-white/10 px-1 py-1 text-[12px] tracking-widest">
          上下にスワイプ
        </span>
      </div>

      {/* 現在のアイテム（動画 or 広告） */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={[
            "relative aspect-[9/16] h-[90vh] max-h-[90vh] overflow-hidden rounded-2xl bg-black",
            "will-change-transform",
            withTransition ? "transition-transform duration-150" : "",
          ].join(" ")}
          style={{ transform: `translateY(${offsetY}px)` }}
        >
          {isAd ? (
            <AdSlot />
          ) : (
            <>
              <video
                key={(cur as V).id}
                ref={vref}
                src={(cur as V).fileUrl}
                className="h-full w-full object-cover"
                playsInline             // iOS必須
                autoPlay                // ミュート時のみ自動再生可
                preload="auto"
                loop
                controls={false}
                muted={isMuted}         // ← 状態で制御
                onLoadedData={() => setReady(true)}
              />
              {/* 音声ONボタン（ミュート時に表示） */}
              {isMuted && (
                <button
                  onClick={() => {
                    setIsMuted(false);
                    vref.current?.play().catch(() => {});
                  }}
                  className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1 text-sm"
                >
                  🔊 タップで音声ON
                </button>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="line-clamp-2 text-sm font-semibold">{(cur as V).title}</div>
                {(cur as V).category && (
                  <div className="mt-1 text-xs opacity-80">#{(cur as V).category}</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* インジケータ（広告を除いたカウント） */}
      <div className="fixed bottom-3 left-1/2 z-20 -translate-x-1/2 text-xs opacity-70">
        {videoOrdinal} / {totalVideos}
      </div>
    </div>
  );
}
