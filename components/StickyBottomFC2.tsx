// components/StickyBottomFC2.tsx
"use client";

import { useMemo, useState } from "react";

export default function StickyBottomFC2() {
  // ▼ あなたが貼った「320x100」タグ（クリック先）
  const href = useMemo(
    () =>
      "https://cnt.affiliate.fc2.com/cgi-bin/click.cgi?aff_userid=355373&aff_siteid=347819&aff_shopid=409",
    [],
  );

  // ▼ 画像（320x100）の生URL
  const rawImg = useMemo(
    () =>
      "https://cnt.affiliate.fc2.com/cgi-bin/banner.cgi?aff_siteid=347819&bid=20987&uid=355373",
    [],
  );

  // ▼ 画像は “自サイトの proxy” 経由にして iOS/Safari でも安定描画
  const imgSrc = useMemo(
    () => `/api/proxy-image.jpg?u=${encodeURIComponent(rawImg)}`,
    [rawImg],
  );

  // 画像がブロック/読み込み失敗した際のフォールバック制御
  const [imgOk, setImgOk] = useState(true);

  return (
    <div
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex justify-center px-3"
      aria-label="fc2-bottom-banner"
      // iPhone のホームバー回避
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 8px)" }}
    >
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto w-full px-3 py-2">
          {imgOk ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="block mx-auto"
              style={{ maxWidth: 340 }}
            >
              {/* 320x100 をビューポート幅にフィット */}
              <img
                src={imgSrc}
                alt="SOD select 見放題（320×100）"
                width={320}
                height={100}
                style={{ display: "block", width: "100%", height: "auto" }}
                loading="eager"
                decoding="async"
                onError={() => setImgOk(false)}
              />
            </a>
          ) : (
            // 画像が表示できないときは CTA のみ表示
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="block w-full rounded-lg bg-white/10 px-4 py-3 text-center text-sm hover:bg-white/15"
            >
              SOD select 見放題をチェック →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
