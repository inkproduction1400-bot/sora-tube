// app/api/i/[t]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = new Set<string>([
  "cnt.affiliate.fc2.com",
  "affiliate.fc2.com",
  "cnt.affliate.fc2.com",
  "affliate.fc2.com",
]);

// Base64URL -> UTF-8 文字列
function fromBase64Url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (input.length % 4)) % 4);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  // ほぼ使われないブラウザ側フォールバック
  return decodeURIComponent(escape(atob(b64)));
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export async function GET(req: NextRequest, ctx: { params: { t: string } }): Promise<Response> {
  const token = ctx.params?.t;
  if (!token) return new NextResponse("Missing token", { status: 400 });

  let raw = "";
  try {
    raw = fromBase64Url(token);
  } catch {
    return new NextResponse("Bad token", { status: 400 });
  }

  let upstream: URL;
  try {
    upstream = new URL(raw);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(upstream.host)) {
    return new NextResponse("Forbidden host", { status: 400 });
  }

  const res = await fetch(upstream.toString(), {
    headers: {
      "user-agent": UA,
      // 画像取得とわかるAccept
      accept: "image/*,*/*;q=0.8",
      // 参照元が必要な広告配信系に備える（自サイトでもOK）
      referer: "https://soratube.tokyo/",
    },
    // CDNがキャッシュするのでno-storeでOK
    cache: "no-store",
  });

  const ct = res.headers.get("content-type") ?? "image/jpeg";
  const status = res.status;

  // ストリーミング優先
  if (res.body) {
    return new Response(res.body, {
      status,
      headers: {
        "content-type": ct,
        "cache-control": "public, max-age=300, s-maxage=300",
      },
    });
  }

  const buf = await res.arrayBuffer();
  return new Response(buf, {
    status,
    headers: {
      "content-type": ct,
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
