"use client";
import { useEffect, useState } from "react";

export default function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = localStorage.getItem("age_ok");
    if (!ok) setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/80 text-white">
      <div className="w-[92%] max-w-sm rounded-2xl bg-zinc-900 p-5">
        <h2 className="text-lg font-bold">年齢確認</h2>
        <p className="mt-2 text-sm opacity-90">
          本サイトは<strong>18歳以上</strong>を対象としたコンテンツを含みます。
          続行できるのは18歳以上の方のみです。
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              localStorage.setItem("age_ok", "1");
              setOpen(false);
            }}
            className="flex-1 rounded-lg bg-white/90 px-4 py-2 text-black font-semibold"
          >
            18歳以上です（入場）
          </button>
          <a
            href="https://www.google.com/"
            className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-center"
          >
            退出
          </a>
        </div>
        <p className="mt-3 text-xs opacity-70">
          入場を選ぶとブラウザに同意が保存され、次回以降は表示されません。
        </p>
      </div>
    </div>
  );
}
