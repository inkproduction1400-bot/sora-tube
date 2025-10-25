// components/StickyBottomFC2.tsx
"use client";

import { usePathname } from "next/navigation";

export default function StickyBottomFC2() {
  const pathname = usePathname();

  // プレイヤー画面では非表示（邪魔にならないように）
  if (pathname?.startsWith("/watch")) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-2"
      aria-label="sticky-bottom-fc2"
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto w-[320px] max-w-[92vw] py-1">
          {/* ▼ FC2のバナータグ（SOD select見放題 320x50） */}
          <a
            href="https://cnt.affiliate.fc2.com/cgi-bin/click.cgi?aff_userid=3553733&aff_siteid=3478198&aff_shopid=409"
            target="_blank"
            rel="nofollow noopener"
          >
            <img
              src="https://cnt.affiliate.fc2.com/cgi-bin/banner.cgi?aff_siteid=3478198&bid=210010&uid=3553733"
              width="320"
              height="50"
              alt="SOD select見放題"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
