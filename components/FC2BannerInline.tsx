// components/FC2BannerInline.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** "320x50" | "300x250" */
  variant?: "320x50" | "300x250";
  /** まだ見えてない時は遅延ロードするための余白 */
  rootMargin?: string;
  /** CLS対策の最小高さ（px） */
  reserveMinPx?: number;
};

/**
 * FC2から発行されたタグ（html文字列）を .env に入れて、それを DOM として挿入する簡易ローダ
 * - NEXT_PUBLIC_FC2_TAG_320x50 / NEXT_PUBLIC_FC2_TAG_300x250 を参照
 * - innerHTML だと <script> が実行されないので、スクリプトは手動で生成して挿入
 */
export default function FC2BannerInline({
  variant = "320x50",
  rootMargin = "200px",
  reserveMinPx,
}: Props) {
  const html320 = process.env.NEXT_PUBLIC_FC2_TAG_320x50?.trim();
  const html300 = process.env.NEXT_PUBLIC_FC2_TAG_300x250?.trim();

  const html = useMemo(() => {
    return variant === "320x50" ? html320 : html300 || html320 || "";
  }, [variant, html320, html300]);

  // デフォルトの最小高さ：320x50 -> 60px, 300x250 -> 260px
  const minH =
    reserveMinPx ??
    (variant === "320x50"
      ? 60
      : 260);

  const ref = useRef<HTMLDivElement | null>(null);
  const [mount, setMount] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // 遅延マウント（可視域直前で）
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;

    const io = new IntersectionObserver(
      (entries) => {
        if (!done && entries[0]?.isIntersecting) {
          done = true;
          setMount(true);
          io.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  // タグ挿入（<script>を実行させる）
  useEffect(() => {
    if (!mount) return;
    if (!ref.current) return;
    if (!html) {
      // タグ未設定なら畳む
      setCollapsed(true);
      return;
    }

    const host = ref.current;
    host.innerHTML = ""; // 一旦クリア

    const tmp = document.createElement("div");
    tmp.innerHTML = html;

    // 子要素を移植、scriptは再生成
    const scripts: HTMLScriptElement[] = [];
    Array.from(tmp.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "SCRIPT") {
        const s = node as HTMLScriptElement;
        const ns = document.createElement("script");
        // 属性コピー
        Array.from(s.attributes).forEach((a) => {
          ns.setAttribute(a.name, a.value);
        });
        if (s.textContent) ns.textContent = s.textContent;
        scripts.push(ns);
      } else {
        host.appendChild(node.cloneNode(true));
      }
    });

    // script 実行（外部/インラインどちらもOK）
    scripts.forEach((s) => host.appendChild(s));

    // ノーフィル検知（数秒後も高さが付いてなければ畳む）
    const t = window.setTimeout(() => {
      const rect = host.getBoundingClientRect();
      if (rect.height < 16) setCollapsed(true);
    }, 4000);

    return () => window.clearTimeout(t);
  }, [mount, html]);

  if (collapsed) return null;

  return (
    <div
      ref={ref}
      style={{
        minHeight: minH,
        display: "grid",
        placeItems: "center",
        width: "100%",
      }}
      aria-label="fc2-inline-banner"
    >
      {!mount ? (
        <div
          style={{
            width: "100%",
            height: minH,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 12,
          }}
        />
      ) : null}
    </div>
  );
}
