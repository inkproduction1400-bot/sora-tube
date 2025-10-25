// components/StickyBottomFC2.tsx
"use client";

import { useMemo } from "react";

export default function StickyBottomFC2() {
  // ▼ あなたのタグ（320x50）に合わせてあります
  const href = useMemo(
    () =>
      "https://cnt.affliate.fc2.com/cgi-bin/click.cgi?aff_userid=3553738&aff_siteid=3478198&aff_shopid=409",
    [],
  );
  const imgSrc = useMemo(
    () =>
      "https://cnt.affliate.fc2.com/cgi-bin/banner.cgi?aff_siteid=3478198&bid=20988&uid=3553733",
    [],
  );

  const W = 320;
  const H = 50;

  return (
    <div
      // ※ “ad/広告” を含まない属性名に
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-2"
      aria-label="fc2-bottom-banner"
    >
      <div
        // 余計な overflow-hidden は付けない
        className="w-full max-w-md rounded-xl border border-white/10 bg-black/70 backdrop-blur"
        style={{ minHeight: H + 10 }}
      >
        <div className="mx-auto w-full" style={{ maxWidth: W }}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="block"
          >
            <img
              src={imgSrc}
              alt="SOD select 見放題"
              width={W}
              height={H}
              style={{ display: "block", width: W, height: H }}
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
