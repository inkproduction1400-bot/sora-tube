// app/c/[group]/[slug]/page.tsx
import { headers } from "next/headers";
import SwipeViewer from "@/components/SwipeViewer";

type V = {
  id: string;
  title: string;
  fileUrl: string;
  thumbUrl?: string;
  durationSec?: number;
  category?: string;
};

async function base() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "");
  return `${proto}://${host}`;
}

async function getVideos(category: string): Promise<V[]> {
  const origin = await base();
  // 十分な件数を取得（必要なら増減OK）
  const res = await fetch(`${origin}/api/videos?category=${encodeURIComponent(category)}&limit=100`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.videos as V[]) ?? [];
}

export default async function CategorySwipePage({
  params,
  searchParams,
}: {
  params: { group: "job" | "style"; slug: string };
  searchParams: { vid?: string };
}) {
  const { slug } = params;
  const vids = await getVideos(slug);
  const initialId = typeof searchParams.vid === "string" ? searchParams.vid : undefined;

  return <SwipeViewer videos={vids} initialId={initialId} />;
}
