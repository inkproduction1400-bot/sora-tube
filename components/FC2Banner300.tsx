// components/FC2Banner300.tsx
"use client";

import { useMemo, useState } from "react";

export default function FC2Banner300() {
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

  // ▼ 画像は proxy 経由で配信（iOS Safari 対策）
  const imgSrc = useMemo(
    () => `/api/proxy-image.jpg?u=${encodeURIComponent(rawImg)}`,
    [rawImg],
  );

  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="grid place-items-center py-2">
      <div
        className="rounded-xl border border-white/10 bg-white/5 p-3"
        style={{ width: "100%", maxWidth: 340 }}
      >
        {imgOk ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="block mx-auto"
            style={{ width: "100%", maxWidth: 320 }}
          >
            <img
              src={imgSrc}
              alt="SOD select 見放題（320×100）"
              width={320}
              height={100}
              style={{ display: "block", width: "100%", height: "auto" }}
              loading="lazy"
              decoding="async"
              onError={() => setImgOk(false)}
            />
          </a>
        ) : (
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
  );
}
