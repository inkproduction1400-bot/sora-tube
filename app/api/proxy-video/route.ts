// app/api/proxy-video/route.ts
import { NextResponse } from "next/server";

// 受け入れるホワイトリスト（オープンプロキシにしないため）
const ALLOWED_HOST_REGEX =
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/.+/i;

// 返却時に必ず付けたい CORS ヘッダ
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
  "Timing-Allow-Origin": "*",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const u = searchParams.get("u");
    if (!u || !ALLOWED_HOST_REGEX.test(u)) {
      return NextResponse.json({ error: "bad url" }, { status: 400 });
    }

    // 先頭 1MB だけで十分にメタデータ＋最初のフレームに届くことが多い
    // （大きくしたい場合は増やしてください）
    const upstream = await fetch(u, {
      // 既存の Range ヘッダが来ていれば尊重、なければ先頭 1MB
      headers: {
        Range: req.headers.get("range") ?? "bytes=0-1048575", // 1MB (= 1024 * 1024 - 1)
      },
      // キャッシュ可：CDN/ブラウザで再利用させる
      cache: "no-store",
    });

    // 元のヘッダから安全なものだけ抽出
    const safeHeaders = new Headers(CORS_HEADERS);
    const passthrough = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "etag",
      "last-modified",
      "cache-control",
    ];
    for (const k of passthrough) {
      const v = upstream.headers.get(k);
      if (v) safeHeaders.set(k, v);
    }
    // 明示キャッシュ（お好みで調整）
    if (!safeHeaders.has("Cache-Control")) {
      safeHeaders.set(
        "Cache-Control",
        "public, s-maxage=86400, stale-while-revalidate=604800",
      );
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: safeHeaders,
    });
  } catch (e) {
    console.error("[proxy-video] error", e);
    return NextResponse.json(
      { error: "proxy failed" },
      { status: 502, headers: CORS_HEADERS },
    );
  }
}
