// components/VideoThumb.tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  id: string;
  title: string;
  category?: string;
  thumbUrl?: string; // 空文字あり
  durationSec?: number;
  fileUrl?: string;  // 自動サムネ生成に使用（任意）
};

/** ▼▼ キャッシュ運用：v2 へ更新 ＋ URL正規化 ▼▼ */
const CACHE_PREFIX = "poster:v2:";
const FAIL_PREFIX = "poster_fail:v2:";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7日
const FAIL_WINDOW_MS = 5 * 60 * 1000; // 5分

// 並列生成のセマフォ（グローバルに保持）
let inflight = 0;
const MAX_CONCURRENCY = 4;
const waitToken = async () => {
  while (inflight >= MAX_CONCURRENCY) {
    await new Promise((r) => setTimeout(r, 40));
  }
  inflight++;
  return () => {
    inflight = Math.max(0, inflight - 1);
  };
};

function normalizeFileUrl(raw?: string) {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    u.search = ""; // クエリ/ハッシュはキーに含めない
    u.hash = "";
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.replace(/\/+$/, ""); // 末尾スラッシュ除去
    }
    u.protocol = u.protocol.toLowerCase(); // スキーム/ホストは小文字化
    u.hostname = u.hostname.toLowerCase();
    return u.toString();
  } catch {
    return raw.trim();
  }
}
function makeKey(fileUrl?: string) {
  return `${CACHE_PREFIX}${normalizeFileUrl(fileUrl)}`;
}
function makeFailKey(fileUrl?: string) {
  return `${FAIL_PREFIX}${normalizeFileUrl(fileUrl)}`;
}

// v1 → v2 マイグレーション（正規化キーと「生URLキー」の両方を対象）
function migrateV1IfNeeded(fileUrl?: string) {
  const norm = normalizeFileUrl(fileUrl);
  if (!fileUrl && !norm) return;

  const rawV1Key = fileUrl ? `poster:v1:${fileUrl}` : null; // 旧実装で?token付与の可能性
  const normV1Key = `poster:v1:${norm}`;
  const v2Key = `poster:v2:${norm}`;

  try {
    const v2 = localStorage.getItem(v2Key);
    const srcV1 =
      localStorage.getItem(normV1Key) ?? (rawV1Key ? localStorage.getItem(rawV1Key) : null);

    if (srcV1 && !v2) {
      localStorage.setItem(v2Key, srcV1);
    }
    if (localStorage.getItem(normV1Key)) localStorage.removeItem(normV1Key);
    if (rawV1Key && localStorage.getItem(rawV1Key)) localStorage.removeItem(rawV1Key);
  } catch {}
}
/** ▲▲ ここまでキャッシュ運用 ▲▲ */

const nz = (s?: string) => (s && s.trim() ? s : undefined);
const isValidImgUrl = (s?: string) => !!(s && /^(https?:\/\/|data:)/i.test(s));

const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280">
      <rect width="100%" height="100%" fill="black"/>
      <text x="50%" y="50%" fill="white" font-family="system-ui,Arial" font-size="56" text-anchor="middle">No Thumb</text>
    </svg>`
  );

// devログ（本番は沈黙）
const dbg = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.debug(...args);
  }
};

export default function VideoThumb({
  id,
  title,
  category,
  thumbUrl,
  durationSec,
  fileUrl,
}: Props) {
  // 初期srcは「妥当なURL」のときだけ採用
  const [src, setSrc] = useState<string | undefined>(
    isValidImgUrl(thumbUrl) ? thumbUrl!.trim() : undefined
  );
  const canGen = !!nz(fileUrl);

  // 可視領域に入ったら生成
  const [visible, setVisible] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  // Skeleton 表示制御
  const [loading, setLoading] = useState(true);

  // 隠し <video>（DOM に置くことが重要）
  const vref = useRef<HTMLVideoElement | null>(null);
  const revokeUrlRef = useRef<string | null>(null);
  const triedRef = useRef(false);

  const log = useCallback(
    (...a: unknown[]) => dbg("[VT]", id, ...a),
    [id]
  );

  // IntersectionObserver: 可視範囲＋200pxで起動
  useEffect(() => {
    if (!hostRef.current) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(hostRef.current);
    return () => io.disconnect();
  }, []);

  // 1) 既存キャッシュ（v1→v2移行＋v2読み出し）
  useEffect(() => {
    if (isValidImgUrl(thumbUrl) || !canGen) {
      setLoading(false);
      return;
    }

    migrateV1IfNeeded(fileUrl); // 先に移行

    const key = makeKey(fileUrl);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const { dataUrl, t } = JSON.parse(raw) as { dataUrl: string; t: number };
        if (Date.now() - t < CACHE_TTL) {
          log("cache hit -> use cached poster", key);
          setSrc(dataUrl);
          setLoading(false);
          return;
        }
        localStorage.removeItem(key);
      }
    } catch (e) {
      log("cache read error", e);
    }
    // キャッシュがなければ、ロードは続行するので loading は一旦trueのまま
  }, [thumbUrl, canGen, fileUrl, log]);

  // 2) 自動生成（常に Blob 経由に統一）
  useEffect(() => {
    // 無効なsrcが入っていたら未設定扱いにする
    if (src && !isValidImgUrl(src)) {
      setSrc(undefined);
      setLoading(true);
      return;
    }
    // 生成不要条件
    if (src || !canGen || !visible) return;

    const video = vref.current;
    if (!video) {
      // 初回で null のことがある。次フレームで再評価をトリガー
      requestAnimationFrame(() => setSrc((s) => s));
      return;
    }

    if (triedRef.current) return;
    triedRef.current = true; // ★ videoが存在してから立てる

    let cancelled = false;

    // window にデバッグ用フックを載せる（any を使わずに）
    (window as unknown as Record<string, unknown>).__vt_last = video;

    const onErr = () => log("video error:", video.error?.message ?? video.error ?? "(no detail)");
    const onStalled = () => log("video stalled");
    const onAbort = () => log("video abort");
    const onEmptied = () => log("video emptied");

    video.addEventListener("error", onErr);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("abort", onAbort);
    video.addEventListener("emptied", onEmptied);

    const cleanup = () => {
      cancelled = true;
      video.removeEventListener("error", onErr);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("abort", onAbort);
      video.removeEventListener("emptied", onEmptied);
      try {
        video.pause();
        video.removeAttribute("src");
        video.load?.();
      } catch {}
      if (revokeUrlRef.current) {
        URL.revokeObjectURL(revokeUrlRef.current);
        revokeUrlRef.current = null;
      }
    };

    const drawPoster = async () => {
      await waitLoaded(video, 8000);
      if (cancelled) return;

      const t = Math.min(0.12, (video.duration || 0) * 0.1 || 0.12);
      safeSeek(video, t);
      await once(video, "seeked");
      if (cancelled) return;

      const w = clampInt(video.videoWidth || 720, 160, 1440);
      const h = Math.round((w * (video.videoHeight || 1280)) / (video.videoWidth || 720));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("2D context unavailable");
      ctx.drawImage(video, 0, 0, w, h);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      if (cancelled) return;

      setSrc(dataUrl);
      setLoading(false);
      try {
        localStorage.setItem(makeKey(fileUrl), JSON.stringify({ dataUrl, t: Date.now() }));
        // 成功したら失敗フラグは消す
        localStorage.removeItem(makeFailKey(fileUrl));
      } catch {}
      log("poster generated", { w, h });
    };

    (async () => {
      const release = await waitToken(); // ★ 並列数制御
      try {
        // 直近で失敗していたら一定時間スキップ
        try {
          const failAt = Number(localStorage.getItem(makeFailKey(fileUrl)) || "0");
          if (failAt && Date.now() - failAt < FAIL_WINDOW_MS) {
            log("skip due to recent fail window");
            setLoading(false);
            return;
          }
        } catch {}

        migrateV1IfNeeded(fileUrl); // 念のため生成前にも

        log("fetch start", fileUrl);
        const resp = await fetch(fileUrl!, { mode: "cors", credentials: "omit" });
        log("fetch done", resp.status, resp.ok);
        if (!resp.ok) throw new Error(`fetch failed: ${resp.status}`);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        revokeUrlRef.current = blobUrl;

        // video 設定（Network に確実に出す）
        video.crossOrigin = "anonymous";
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.src = blobUrl;

        try {
          video.load?.();
        } catch {}
        log("video load() called with blobUrl");

        await drawPoster();
      } catch (e) {
        log("generate failed:", e);
        setLoading(false);
        try {
          localStorage.setItem(makeFailKey(fileUrl), String(Date.now()));
        } catch {}
      } finally {
        release();
      }
    })();

    return cleanup;
  }, [src, canGen, visible, fileUrl, id, log]);

  const safeImgSrc = useMemo(() => {
    if (src && (src.startsWith("data:") || /^https?:\/\//.test(src))) return src;
    return FALLBACK_SVG;
  }, [src]);

  const duration = useMemo(() => formatDuration(durationSec), [durationSec]);

  return (
    // ★ Link を外し“見た目専用”に変更（親側で<Link>で包む）
    <div className="block">
      {/* 隠し video：DOM に置くことが重要（Chrome が実ロード） */}
      {canGen && (
        <video
          ref={vref}
          className="pointer-events-none absolute -z-10 h-0 w-0 opacity-0"
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          aria-hidden="true"
        />
      )}

      <div
        ref={hostRef}
        className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-white/5"
      >
        {/* Skeleton（生成中だけ） */}
        {loading && <div className="absolute inset-0 animate-pulse bg-white/10" />}

        <img
          src={safeImgSrc}
          alt={title}
          className="h-full w-full object-cover"
          draggable={false}
          decoding="async"
        />
        {category && (
          <span className="absolute right-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-[2px] text-[10px] font-semibold">
            #{category}
          </span>
        )}
        {duration && (
          <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 px-1.5 py-[2px] text-[11px]">
            {duration}
          </span>
        )}
      </div>

      <div className="mt-1.5 line-clamp-1 text-sm opacity-95">{title}</div>
    </div>
  );
}

/* ---------- helpers ---------- */

function formatDuration(sec?: number) {
  if (!sec || sec <= 0) return undefined;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function once<T extends keyof HTMLMediaElementEventMap>(v: HTMLVideoElement, name: T) {
  return new Promise<void>((res, rej) => {
    const onOk = () => {
      v.removeEventListener("error", onErr);
      res();
    };
    const onErr = () => {
      v.removeEventListener(name, onOk);
      rej(v.error ?? new Error("media error"));
    };
    v.addEventListener(name, onOk, { once: true });
    v.addEventListener("error", onErr, { once: true });
  });
}

async function waitLoaded(v: HTMLVideoElement, timeoutMs = 8000) {
  const tasks = [
    once(v, "loadedmetadata"),
    once(v, "canplay"),
    (async () => {
      try {
        await v.play(); // デコードを始めさせる
        await new Promise((r) => setTimeout(r, 60));
        v.pause();
      } catch {}
    })(),
  ];
  const timeout = new Promise<void>((_, rej) =>
    setTimeout(() => rej(new Error("decode timeout")), timeoutMs)
  );
  await Promise.race([Promise.allSettled(tasks).then(() => {}), timeout]);
}

function safeSeek(v: HTMLVideoElement, t: number) {
  try {
    v.currentTime = Math.max(0, t);
  } catch {}
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n || 0)));
}
