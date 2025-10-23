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
  const { group, slug } = await params;
  const { v: initialId } = await searchParams;

  // group は "job" | "style" 想定。API は tags を category として受けている実装なので
  // slug をそのまま category= に渡せばOK（API側で tags array-contains を使っている）
  const videos = await getVideos({ category: slug, limit: "100" });

  return (
    <SwipeViewer videos={videos} initialId={initialId} />
  );
}
