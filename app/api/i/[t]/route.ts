// app/api/i/[t]/route.ts
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = new Set<string>([
  "cnt.affiliate.fc2.com",
  "affiliate.fc2.com",
  "cnt.affliate.fc2.com",
  "affliate.fc2.com",
]);

function fromBase64Url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(b64, "base64").toString("utf8");
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ t: string }> } // ← Next.js 15 では Promise
): Promise<Response> {
  const { t } = await ctx.params;
  if (!t) return new Response("Missing token", { status: 400 });

  let raw = "";
  try {
    raw = fromBase64Url(t);
  } catch {
    return new Response("Bad token", { status: 400 });
  }

  let upstream: URL;
  try {
    upstream = new URL(raw);
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(upstream.host)) {
    return new Response("Forbidden host", { status: 400 });
  }

  const res = await fetch(upstream.toString(), {
    headers: {
      "user-agent": UA,
      accept: "image/*,*/*;q=0.8",
      referer: "https://soratube.tokyo/",
    },
    cache: "no-store",
  });

  const ct = res.headers.get("content-type") ?? "image/jpeg";
  const status = res.status;

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
