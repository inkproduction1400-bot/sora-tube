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
 * - ついでに affliate → affiliate のタイポ修正、http → https へ強制、a要素へ target/rel 付与も行う
 */
export default function FC2BannerInline({
  variant = "320x50",
  rootMargin = "200px",
  reserveMinPx,
}: Props) {
  const html320 = process.env.NEXT_PUBLIC_FC2_TAG_320x50?.trim();
  const html300 = process.env.NEXT_PUBLIC_FC2_TAG_300x250?.trim();

  // まずはサイズに応じた生HTMLを決める
  const htmlRaw = useMemo(() => {
    return variant === "320x50" ? html320 : html300 || html320 || "";
  }, [variant, html320, html300]);

  // FC2側でよくある「affliate」の綴りミス・http混在を補正
  const html = useMemo(() => {
    let s = htmlRaw || "";
    // ドメインのタイポ修正
    s = s.replaceAll("cnt.affliate.fc2.com", "cnt.affiliate.fc2.com");
    // http → https 強制
    s = s.replaceAll('src="http://', 'src="https://').replaceAll(
      'href="http://',
      'href="https://',
    );
    return s;
  }, [htmlRaw]);

  // デフォルトの最小高さ：320x50 -> 60px, 300x250 -> 260px
  const minH = reserveMinPx ?? (variant === "320x50" ? 60 : 260);

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

  // タグ挿入（<script>も実行させる）。a/img の安全化＆リサイズ最適化もここで。
  useEffect(() => {
    if (!mount) return;
    const host = ref.current;
    if (!host) return;

    if (!html) {
      setCollapsed(true);
      return;
    }

    host.innerHTML = "";

    const tmp = document.createElement("div");
    tmp.innerHTML = html;

    // a/img の後処理（target/rel 付与、幅に追従するよう style を入れる）
    const a = tmp.querySelector("a");
    if (a) {
      a.setAttribute("target", "_blank");
      // nofollow はFC2レギュレーション的にもOK
      a.setAttribute("rel", "noopener noreferrer nofollow");
    }
    const img = tmp.querySelector("img");
    if (img) {
      // サイズ属性を尊重しつつ、親幅で縮小・拡大はしない
      const w = img.getAttribute("width");
      const h = img.getAttribute("height");
      // 幅いっぱいにしたい場合は width:100% / height:auto だが、
      // 今回はオリジナル寸法を維持してセンタリングする想定なので block のみ付与
      img.setAttribute(
        "style",
        ["display:block", w && h ? "" : "max-width:100%"].filter(Boolean).join(";"),
      );
      // https 強制（保険）
      const src = img.getAttribute("src");
      if (src?.startsWith("http://")) img.setAttribute("src", src.replace("http://", "https://"));
    }

    // 子要素を移植、scriptは再生成して実行
    const scripts: HTMLScriptElement[] = [];
    Array.from(tmp.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "SCRIPT") {
        const s = node as HTMLScriptElement;
        const ns = document.createElement("script");
        Array.from(s.attributes).forEach((a) => ns.setAttribute(a.name, a.value));
        if (s.textContent) ns.textContent = s.textContent;
        scripts.push(ns);
      } else {
        host.appendChild(node.cloneNode(true));
      }
    });
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
      // “ad/広告/banner” などの単語は避ける（ブロッカー対策）
      aria-label="sponsored-inline"
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
