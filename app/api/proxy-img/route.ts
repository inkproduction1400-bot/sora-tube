// app/api/proxy-image/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge"; // 速い & ストリーミング

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const u = searchParams.get("u");
    if (!u) return NextResponse.json({ error: "missing u" }, { status: 400 });

    // FC2の画像を取得（ヘッダは最小限）
    const upstream = await fetch(u, {
      // iOSの挙動を考慮してReferrer等を送らない
      headers: { "User-Agent": req.headers.get("user-agent") || "" },
      // サードパーティCookieは不要
      redirect: "follow",
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "upstream error" }, { status: 502 });
    }

    // content-type をそのまま流す
    const contentType = upstream.headers.get("content-type") ?? "image/gif";
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "content-type": contentType,
        // 短めキャッシュ（必要なら調整）
        "cache-control": "public, max-age=300",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "proxy failed" }, { status: 500 });
  }
}
