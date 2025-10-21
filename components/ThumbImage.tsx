"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

const CACHE_PREFIX = "poster:v1:";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7日

type Props = {
  fileUrl: string;
  thumbUrl?: string; // 空文字も来る可能性あり
  alt?: string;
  className?: string;
};

const norm = (s?: string) => (s && s.trim() !== "" ? s : undefined);

export default function ThumbImage({ fileUrl, thumbUrl, alt, className }: Props) {
  const [src, setSrc] = useState<string | undefined>(() => norm(thumbUrl));
  const made = useRef(false);

  useEffect(() => {
    const explicit = norm(thumbUrl);
    if (explicit) { setSrc(explicit); return; }

    const key = CACHE_PREFIX + fileUrl;
    // 1) キャッシュ命中？
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (raw) {
      try {
        const { dataUrl, t } = JSON.parse(raw) as { dataUrl: string; t: number };
        if (Date.now() - t < CACHE_TTL) { setSrc(dataUrl); return; }
        localStorage.removeItem(key);
      } catch {}
    }

    // 2) 先頭フレームから生成（1回だけ）
    if (made.current) return;
    made.current = true;

    const v = document.createElement("video");
    v.src = fileUrl;
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";

    const onLoaded = async () => {
      try {
        try { v.currentTime = 0.1; } catch {}
        await new Promise<void>(r => v.addEventListener("seeked", () => r(), { once: true }));
        const w = v.videoWidth || 720, h = v.videoHeight || 1280;
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d"); if (!ctx) return;
        ctx.drawImage(v, 0, 0, w, h);
        const dataUrl = c.toDataURL("image/jpeg", 0.7);
        setSrc(dataUrl);
        try { localStorage.setItem(key, JSON.stringify({ dataUrl, t: Date.now() })); } catch {}
      } catch {}
    };

    v.addEventListener("loadedmetadata", onLoaded, { once: true });

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.src = ""; // 解放
    };
  }, [fileUrl, thumbUrl]);

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-white/5 text-white/80 ${className}`}>
        <span className="text-[12px]">No Thumb</span>
      </div>
    );
  }

  return <img src={src} alt={alt ?? ""} className={className} />;
}
