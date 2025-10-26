"use client";

import { useMemo, useState } from "react";

function toBase64Url(s: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(s, "utf8").toString("base64url");
  }
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export default function FC2Banner300() {
  const href = useMemo(
    () =>
      "https://cnt.affiliate.fc2.com/cgi-bin/click.cgi?aff_userid=3553738&aff_siteid=3478198&aff_shopid=409",
    [],
  );

  // 300x250 用の画像先
  const rawImg = useMemo(
    () =>
      "https://cnt.affiliate.fc2.com/cgi-bin/banner.cgi?aff_siteid=3478198&bid=210010&uid=3553733",
    [],
  );

  const token = useMemo(() => toBase64Url(rawImg), [rawImg]);
  const imgSrc = useMemo(() => `/api/i/${token}`, [token]);

  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="grid place-items-center py-2">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3" style={{ width: "100%", maxWidth: 360 }}>
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
              alt="SOD select 見放題（300x250）"
              style={{ display: "block", width: "100%", height: "auto" }}
              width={300}
              height={250}
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
  );
}
