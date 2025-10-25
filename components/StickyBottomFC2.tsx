// components/StickyBottomFC2.tsx
"use client";

import { useMemo, useState } from "react";

export default function StickyBottomFC2() {
  const href = useMemo(
    () =>
      "https://cnt.affliate.fc2.com/cgi-bin/click.cgi?aff_userid=3553738&aff_siteid=3478198&aff_shopid=409",
    [],
  );
  const rawImg = useMemo(
    () =>
      "https://cnt.affliate.fc2.com/cgi-bin/banner.cgi?aff_siteid=3478198&bid=20988&uid=3553733",
    [],
  );

  // ★ 自ドメイン経由に
  const imgSrc = useMemo(() => `/api/proxy-image?u=${encodeURIComponent(rawImg)}`, [rawImg]);

  const [imgOk, setImgOk] = useState(true);

  return (
    <div
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex justify-center px-3"
      aria-label="fc2-bottom-banner"
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
              <img
                src={imgSrc}
                alt="SOD select 見放題"
                style={{ display: "block", width: "100%", height: "auto" }}
                width={320}
                height={50}
                loading="eager"
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
    </div>
  );
}
