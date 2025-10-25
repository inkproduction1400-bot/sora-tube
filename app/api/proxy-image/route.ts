// app/api/proxy-image/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// FC2の両表記（affiliate / affliate）と cnt サブドメインを許可
const ALLOWED_HOSTS = new Set<string>([
  "cnt.affiliate.fc2.com",
  "affiliate.fc2.com",
  "cnt.affliate.fc2.com",
  "affliate.fc2.com",
]);

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const u = searchParams.get("u");
  if (!u) return new NextResponse("Missing param: u", { status: 400 });

  let upstream: URL;
  try {
    upstream = new URL(u);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(upstream.host)) {
    return new NextResponse("Forbidden host", { status: 400 });
  }

  const upstreamRes = await fetch(upstream.toString(), {
    headers: {
      "user-agent": UA,
      accept: "image/*,*/*;q=0.8",
    },
    // 画像は都度取得（CDNにキャッシュされる）
    cache: "no-store",
  });

  const contentType = upstreamRes.headers.get("content-type") ?? "image/jpeg";
  const status = upstreamRes.status;

  // ストリーミングでそのまま返す
  const body = upstreamRes.body;
  if (body) {
    return new Response(body, {
      status,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=300, s-maxage=300",
      },
    });
  }

  // bodyが無い場合はArrayBufferで返すフォールバック
  const buf = await upstreamRes.arrayBuffer();
  return new Response(buf, {
    status,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
