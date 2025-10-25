// app/api/proxy-image/route.ts
export const dynamic = "force-dynamic";
// 任意: Edge/Node どちらでも可。必要なら以下を有効化
// export const runtime = "edge";

function bad(msg: string, code = 400) {
  return new Response(msg, { status: code, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const u = url.searchParams.get("u");
  if (!u) return bad("Missing query param: u");

  // ここで許可リストをかけておく（安全のため）
  try {
    const upstream = new URL(u);
    const allowed = /^https:\/\/cnt\.affiliate?\.fc2\.com\/cgi-bin\/banner\.cgi/i.test(upstream.href);
    if (!allowed) return bad("blocked upstream", 400);

    const r = await fetch(upstream.toString(), {
      redirect: "follow",
      headers: {
        // iOS Safari 互換の UA/Accept を付与
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Accept": "image/avif,image/webp,image/*,*/*;q=0.8",
        "Accept-Language": "ja,en;q=0.9",
        // 参照元が必要なケースに備えて自サイトを付ける
        "Referer": "https://soratube.tokyo/",
        "Cache-Control": "no-cache",
      },
    });

    if (!r.ok) return bad(`upstream ${r.status}`, r.status);

    const ct = r.headers.get("content-type") ?? "image/jpeg";
    const body = await r.arrayBuffer();

    // 画像として明示、キャッシュも付与
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": ct,
        // 5分ブラウザ、1日エッジ
        "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch (e: any) {
    return bad(`error: ${e?.message ?? e}`, 500);
  }
}
