// app/api/proxy-img/route.ts
import { NextResponse } from "next/server";

export const revalidate = 300; // 5分キャッシュ

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const u = searchParams.get("u");
    if (!u) return NextResponse.json({ error: "missing u" }, { status: 400 });

    // FC2の画像URLのみ許可（念のための簡易バリデーション）
    const url = new URL(u);
    if (!/\.fc2\.com$/i.test(url.hostname)) {
      return NextResponse.json({ error: "forbidden host" }, { status: 403 });
    }

    const upstream = await fetch(url.toString(), {
      // iOS対策: UA/Referer などを明示（不要なら外してOK）
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        Referer: "https://affiliate.fc2.com/",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "upstream " + upstream.status }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await upstream.arrayBuffer());
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=300, s-maxage=300, immutable",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "proxy-failed" }, { status: 500 });
  }
}
