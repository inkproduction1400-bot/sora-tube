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

async function getVideos(params: Record<string, string>): Promise<V[]> {
  const origin = await base();
  const qs = `?${new URLSearchParams(params).toString()}`;
  const res = await fetch(`${origin}/api/videos${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.videos as V[]) ?? [];
}

export default async function SwipeCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ group: string; slug: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { slug } = await params;
  const { v: initialId } = await searchParams;

  // API は category=slug で tags array-contains フィルタ
  const videos = await getVideos({ category: slug, limit: "100" });

  return <SwipeViewer videos={videos} initialId={initialId ?? undefined} />;
}
