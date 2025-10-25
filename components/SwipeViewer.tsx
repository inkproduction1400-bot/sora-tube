// components/SwipeViewer.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEventHandler,
  type WheelEventHandler,
} from "react";
import Link from "next/link";
// import OutstreamAd from "@/components/OutstreamAd";
import FC2BannerAd from "@/components/FC2BannerAd";

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
  /** 例: 3 を渡すと 3 本ごとに広告を差し込む。未指定なら環境変数、なければ 3。0/負数なら差し込みなし */
  adEvery,
}: {
  videos: V[];
  initialId?: string;
  adEvery?: number;
}) {
  // --- 広告の有効化と頻度 ---
  // 未設定なら true 扱い（"false" のときだけ無効）
  const adEnabled =
    (process.env.NEXT_PUBLIC_AD_ENABLED ?? "true").toLowerCase() !== "false";

  const envFreq =
    process.env.NEXT_PUBLIC_EXO_FREQUENCY ??
    process.env.NEXT_PUBLIC_AD_FREQUENCY ?? // 旧名フォールバック
    "3";

  const freqRaw = typeof adEvery === "number" ? adEvery : Number(envFreq);
  const freq = Number.isFinite(freqRaw) ? Math.floor(freqRaw) : 3; // NaN ガード
  const useAds = adEnabled && freq > 0; // freq <= 0 なら広告なし

  // 広告を差し込んだ配列
  const merged: Item[] = useMemo(() => {
    if (!useAds) return videos;
    const f = Math.max(1, freq); // 念のため最小 1
    const out: Item[] = [];
    videos.forEach((v, idx) => {
      // 先頭の直前では挿入しない：idx > 0 のときのみチェック
      if (idx > 0 && idx % f === 0) out.push({ __ad: true, key: `ad-${idx}` });
      out.push(v);
    });
    return out;
  }, [videos, useAds, freq]);

  // initialId を merged のインデックスへ変換
  const startMergedIndex = useMemo(() => {
    const pureIdx = (() => {
      if (!initialId) return 0;
      const i = videos.findIndex((v) => v.id === initialId);
      return i >= 0 ? i : 0;
    })();

    if (!useAds) return pureIdx;

    // pureIdx の手前に挿入された広告個数 = floor(pureIdx / freq)
    const adCountBefore = Math.floor(pureIdx / Math.max(1, freq));
    const idxWithAds = pureIdx + adCountBefore;
    return Math.max(0, Math.min(merged.length - 1, idxWithAds));
  }, [initialId, videos, useAds, freq, merged.length]);

  // idx は videos/initialId 変化時に再同期
  const [idx, setIdx] = useState(startMergedIndex);
  useEffect(() => {
    setIdx(startMergedIndex);
  }, [startMergedIndex]);

  const curr = merged[idx];
  const isAd = !!curr && isAdItem(curr);

  const [bounce, setBounce] = useState<"top" | "bottom" | null>(null);

  // タッチ/スワイプ
  const touchStartY = useRef<number | null>(null);
  const THRESH = 40;

  const bounceOnce = (where: "top" | "bottom") => {
    setBounce(where);
    setTimeout(() => setBounce(null), 180);
  };

  const toPrev = useCallback(() => {
    setIdx((current) => {
      if (current > 0) return current - 1;
      bounceOnce("top");
      return current;
    });
  }, []);

  const toNext = useCallback(() => {
    setIdx((current) => {
      if (current < merged.length - 1) return current + 1;
      bounceOnce("bottom");
      return current;
    });
  }, [merged.length]);

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
  const onWheel: WheelEventHandler<HTMLDivElement> = (e) => {
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
  }, [toPrev, toNext]);

  // 再生コントロール
  const vref = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);

  // インデックス変更時：ミュートに戻す（広告行では動画処理なし）
  useEffect(() => {
    setMuted(true);
  }, [idx]);

  // 動画ソースやミュート状態が変わったら再生
  useEffect(() => {
    if (isAd) return;
    const v = vref.current;
    if (!v) return;
    v.muted = muted;
    v.play().catch(() => {});
  }, [isAd, muted, idx]);

  // ---- Hooks はここまでに宣言（以降で条件分岐OK）----

  // 広告を除いた“何本目/全体”インジケータ
  const videoOrdinal = useMemo(() => {
    let count = 0;
    for (let k = 0; k <= idx; k++) {
      if (!isAdItem(merged[k])) count++;
    }
    return count;
  }, [idx, merged]);
  const totalVideos = videos.length;

  // curr が無い場合
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
            {isAdItem(curr) ? (
              // n本おきに FC2 バナーを挿入（1スクリーンに1枠のみ）
              <FC2BannerAd size="300x250" />
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
