// app/api/proxy-image/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const u = searchParams.get("u");
    if (!u) {
      return NextResponse.json({ error: "missing u" }, { status: 400 });
    }

    // FC2 側が参照元チェック等で弾かないよう、受理されやすいヘッダを付与
    const upstream = await fetch(u, {
      headers: {
        // 画像受理されやすいAccept
        Accept:
          "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        // 参照元をFC2系に（実際の画面の挙動に近づける）
        Referer: "https://affiliate.fc2.com/",
        // 過剰ではない一般的なUA
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `upstream error ${upstream.status}` },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "image/gif";
    // 軽めのキャッシュ（CDN）
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "proxy failed" }, { status: 500 });
  }
}
