// app/api/proxy-image/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) return new NextResponse("missing u", { status: 400 });

  try {
    const upstream = await fetch(u, {
      redirect: "follow",
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent": req.headers.get("user-agent") ?? "",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return new NextResponse(`bad upstream: ${upstream.status}`, { status: 502 });
    }

    const buf = await upstream.arrayBuffer();
    const ct = upstream.headers.get("content-type") ?? "image/gif";

    const ext =
      ct.includes("jpeg") ? "jpg" :
      ct.includes("png")  ? "png" :
      ct.includes("webp") ? "webp" :
      ct.includes("avif") ? "avif" : "gif";

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": ct,
        "Content-Disposition": `inline; filename="banner.${ext}"`,
        "Cache-Control": "public, s-maxage=3600, max-age=600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return new NextResponse("error", { status: 500 });
  }
}
