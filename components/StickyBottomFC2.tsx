// components/StickyBottomFC2.tsx
"use client";

import { useMemo, useState } from "react";

export default function StickyBottomFC2() {
  // FC2のあなたのタグに合わせた遷移先（click.cgi）
  const href = useMemo(
    () =>
      "https://cnt.affliate.fc2.com/cgi-bin/click.cgi?aff_userid=3553738&aff_siteid=3478198&aff_shopid=409",
    [],
  );
  // バナー画像（banner.cgi）
  const imgSrc = useMemo(
    () =>
      "https://cnt.affliate.fc2.com/cgi-bin/banner.cgi?aff_siteid=3478198&bid=20988&uid=3553733",
    [],
  );

  // 画像ブロック時のフォールバック表示制御
  const [imgOk, setImgOk] = useState(true);

  return (
    <div
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex justify-center px-3"
      aria-label="fc2-bottom-banner"
      // iOS安全領域
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
              {/* 画像は100%でスケール（モバイル幅にフィット） */}
              <img
                src={imgSrc}
                alt="SOD select 見放題"
                style={{ display: "block", width: "100%", height: "auto" }}
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer-when-downgrade"
                onError={() => setImgOk(false)}
              />
            </a>
          ) : (
            // 画像がブロック/失敗した場合のフォールバックCTA
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
