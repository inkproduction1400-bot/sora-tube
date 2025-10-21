// components/SwipeViewer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type V = {
  id: string;
  title: string;
  fileUrl: string;
  thumbUrl?: string;
  durationSec?: number;
  category?: string;
};

export default function SwipeViewer({
  videos,
  initialId,
}: {
  videos: V[];
  initialId?: string;
}) {
  const startIndex = useMemo(() => {
    if (!initialId) return 0;
    const idx = videos.findIndex((v) => v.id === initialId);
    return idx >= 0 ? idx : 0;
  }, [videos, initialId]);

  const [idx, setIdx] = useState(startIndex);
  const [bounce, setBounce] = useState<"top" | "bottom" | null>(null);

  const curr = videos[idx];

  // タッチ/スワイプ
  const touchStartY = useRef<number | null>(null);
  const THRESH = 40;

  const toPrev = () => {
    if (idx > 0) setIdx(idx - 1);
    else bounceOnce("top");
  };
  const toNext = () => {
    if (idx < videos.length - 1) setIdx(idx + 1);
    else bounceOnce("bottom");
  };
  const bounceOnce = (where: "top" | "bottom") => {
    setBounce(where);
    setTimeout(() => setBounce(null), 180);
  };

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > THRESH) {
      if (dy > 0) toPrev(); // 下→上へ戻す：前へ
      else toNext();        // 上へスワイプ：次へ
    }
    touchStartY.current = null;
  };

  // マウスホイール・キーボードも対応
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
  }, [idx, videos.length]);

  // 再生コントロール
  const vref = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true); // 初期はミュートで自動再生OK
  const [ready, setReady] = useState(false);

  // インデックス変更時：ミュートに戻して準備し直す
  useEffect(() => {
    setMuted(true);
    setReady(false);
  }, [idx]);

  // 動画ソースやミュート状態が変わったら再生を合わせる
  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    v.muted = muted;
    v.play().catch(() => {
      // iOSでユーザー操作がないと失敗することがあるが、muted時は通る想定
    });
  }, [idx, curr?.fileUrl, muted]);

  if (!curr) {
    return (
      <main className="grid h-[100dvh] place-content-center bg-black text-white">
        このカテゴリには動画がありません
      </main>
    );
  }

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
            <video
              key={curr.id}
              ref={vref}
              src={curr.fileUrl}
              poster={curr.thumbUrl}
              className="h-full w-full object-contain"
              playsInline          // iOS必須
              autoPlay             // muted時のみ自動再生可
              preload="auto"
              muted={muted}
              onLoadedData={() => setReady(true)}
            />
            {/* タイトル */}
            <div className="absolute bottom-3 left-3 right-3 line-clamp-2 rounded-lg bg-black/35 p-2 text-sm">
              {curr.title}
            </div>

            {/* 音声ONボタン（初回タップで解除） */}
            {muted && (
              <button
                onClick={() => {
                  setMuted(false);
                  // ユーザー操作内で明示再生（iOS対策）
                  vref.current?.play().catch(() => {});
                }}
                className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1 text-sm"
              >
                🔊 タップで音声ON
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
