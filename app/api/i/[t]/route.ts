// app/api/i/[t]/route.ts
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function b64urlDecode(t: string): string {
  // Base64URL → Base64
  const b64 = t.replace(/-/g, "+").replace(/_/g, "/");
  // パディング付与
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const raw = b64 + pad;
  // atob 代替
  const bin = Buffer.from(raw, "base64").toString("utf8");
  return bin;
}

export async function GET(
  req: NextRequest,
  ctx: { params: { t: string } }
): Promise<Response> {
  try {
    const token = ctx.params?.t;
    if (!token) {
      return new Response("missing", { status: 400 });
    }

    const url = b64urlDecode(token);

    // 上流から取得（リダイレクトも追随）
    const upstream = await fetch(url, {
      // iOS Safari 対策：キャッシュを許容（長すぎない範囲で）
      cache: "no-store",
      redirect: "follow",
      // 一部CDNがUAで分岐する場合に備えて
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SoraTubeImageProxy/1.0; +https://soratube.tokyo)",
      },
    });

    if (!upstream.ok) {
      return new Response(`upstream ${upstream.status}`, {
        status: 502,
      });
    }

    // バイナリへ読み切る（Safariの白画面対策で Content-Length を付ける）
    const arrayBuffer = await upstream.arrayBuffer();

    // MIME 推定：上流優先、なければ JPEG に倒す
    const mime =
      upstream.headers.get("content-type")?.split(";")[0]?.trim() ||
      "image/jpeg";

    const headers = new Headers();
    headers.set("Content-Type", mime);
    headers.set("Cache-Control", "public, max-age=86400"); // 24h
    headers.set("Content-Length", String(arrayBuffer.byteLength));
    // ダウンロード扱いにさせない
    headers.set("Content-Disposition", "inline");

    return new Response(arrayBuffer, { status: 200, headers });
  } catch (e) {
    return new Response("error", { status: 500 });
  }
}
