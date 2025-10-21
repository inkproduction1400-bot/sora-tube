// components/VerticalVideo.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";

type Props = {
  id: string;
  fileUrl: string;
  poster?: string;
  /** 既定: "auto"（即再生） / "poster-first": サムネ表示後に再生 */
  mode?: "auto" | "poster-first";
};

const CACHE_PREFIX = "poster:v1:";             // 将来の破棄用バージョン
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;  // 7日

export default function VerticalVideo({ id, fileUrl, poster, mode = "auto" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [autoPoster, setAutoPoster] = useState<string | undefined>(poster);

  // ★ 追加：ミュート状態を状態管理（初期はtrueで自動再生を成立させる）
  const [isMuted, setIsMuted] = useState(true);
  const [ready, setReady] = useState(false);

  // 1) 起動時：キャッシュがあれば即適用
  useEffect(() => {
    if (poster) { setAutoPoster(poster); return; }
    const key = CACHE_PREFIX + fileUrl;
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (raw) {
      try {
        const { dataUrl, t } = JSON.parse(raw) as { dataUrl: string; t: number };
        if (Date.now() - t < CACHE_TTL_MS) setAutoPoster(dataUrl);
        else localStorage.removeItem(key); // 期限切れは掃除
      } catch { /* noop */ }
    } else {
      setAutoPoster(undefined);
    }
  }, [fileUrl, poster]);

  // 2) ポスター未設定なら最初のフレームから生成 → キャッシュ保存
  useEffect(() => {
    if (poster) return;
    const v = videoRef.current; if (!v) return;
    let cancelled = false;

    const makePoster = async () => {
      try {
        await once(v, "loadedmetadata");
        safeSeek(v, 0.1); await once(v, "seeked");

        const canvas = document.createElement("canvas");
        canvas.width = v.videoWidth || 720;
        canvas.height = v.videoHeight || 1280;
        const ctx = canvas.getContext("2d"); if (!ctx) return;
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        if (cancelled) return;
        setAutoPoster(dataUrl);

        try {
          localStorage.setItem(
            CACHE_PREFIX + fileUrl,
            JSON.stringify({ dataUrl, t: Date.now() })
          );
        } catch { /* localStorage容量不足は無視 */ }
      } catch { /* noop */ }
    };

    makePoster();
    return () => { cancelled = true; };
  }, [fileUrl, poster]);

  // 3) 再生制御（poster-first時はサムネ準備完了まで待つ）
  useEffect(() => {
    const v = videoRef.current; if (!v) return;

    // 新しい動画/モード開始時はミュートに戻し、準備フラグもリセット
    setIsMuted(true);
    setReady(false);

    if (mode === "poster-first") {
      try { v.pause(); } catch {}
    }

    const tryPlay = () => {
      if (mode === "poster-first" && !autoPoster) return; // サムネ準備完了待ち
      v.muted = true; // 初動は必ずミュートで
      v.play().catch(() => { /* 自動再生不可端末は無視 */ });
    };

    const onCanPlay = () => tryPlay();
    v.addEventListener("canplay", onCanPlay);
    tryPlay();

    return () => v.removeEventListener("canplay", onCanPlay);
  }, [fileUrl, mode, autoPoster]);

  // 4) ミュート状態の反映。音声ON直後は play() を明示（iOS対策）
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    v.muted = isMuted;
    if (!isMuted && ready) {
      v.play().catch(() => { /* iOSで失敗したら無視（ユーザー操作内で再試行） */ });
    }
  }, [isMuted, ready]);

  return (
    <div className="relative">
      <video
        key={fileUrl}                 // URL変更時に確実に再初期化
        ref={videoRef}
        src={fileUrl}
        poster={autoPoster}
        playsInline                   // ★ iOS必須
        loop
        autoPlay                      // ★ ミュート時のみ自動再生成立
        controls={false}
        preload="auto"
        crossOrigin="anonymous"       // canvasサムネ生成のため
        className="h-[90dvh] w-full rounded-2xl object-cover bg-black"
        onLoadedData={() => setReady(true)}
        muted={isMuted}               // ★ 状態で制御
      />

      {/* 音声ONボタン（ミュート時のみ表示） */}
      {isMuted && (
        <button
          onClick={() => {
            setIsMuted(false);
            // ユーザー操作内での再生を明示（iOS対策）
            videoRef.current?.play().catch(() => {});
          }}
          className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-1 text-sm"
        >
          🔊 タップで音声ON
        </button>
      )}

      <FavoriteButton videoId={id} />
    </div>
  );
}

/* helpers */
function once<T extends keyof HTMLVideoElementEventMap>(v: HTMLVideoElement, name: T) {
  return new Promise<void>((res) => v.addEventListener(name, () => res(), { once: true }));
}
function safeSeek(v: HTMLVideoElement, t: number) { try { v.currentTime = t; } catch {} }
