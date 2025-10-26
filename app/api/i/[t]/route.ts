// app/api/i/[t]/route.ts
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function b64urlDecode(t: string): string {
  const b64 = t.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, "base64").toString("utf8");
}

type Params = { t: string };

// ★ Next.js 15: params は Promise なので await が必須
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<Params> }
): Promise<Response> {
  try {
    const { t } = await ctx.params;
    if (!t) return new Response("missing", { status: 400 });

    const url = b64urlDecode(t);

    const upstream = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SoraTubeImageProxy/1.0; +https://soratube.tokyo)",
      },
    });

    if (!upstream.ok) {
      return new Response(`upstream ${upstream.status}`, { status: 502 });
    }

    // iOS Safari の白画面対策: 全読みして Content-Length を付与
    const ab = await upstream.arrayBuffer();
    const mime =
      upstream.headers.get("content-type")?.split(";")[0]?.trim() ||
      "image/jpeg";

    const headers = new Headers();
    headers.set("Content-Type", mime);
    headers.set("Content-Length", String(ab.byteLength));
    headers.set("Cache-Control", "public, max-age=86400");
    headers.set("Content-Disposition", "inline");

    return new Response(ab, { status: 200, headers });
  } catch {
    return new Response("error", { status: 500 });
  }
}
