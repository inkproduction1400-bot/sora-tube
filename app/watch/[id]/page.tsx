// app/watch/[id]/page.tsx
import { headers } from "next/headers";
import SwipeViewer from "@/components/SwipeViewer";

type Raw = {
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

async function getById(id: string): Promise<Raw | null> {
  const origin = await base();
  const res = await fetch(`${origin}/api/videos?id=${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  const v = (data.videos as Raw[])?.[0];
  return v ?? null;
}

async function getByCategory(cat?: string): Promise<Raw[]> {
  const origin = await base();
  const qs = cat ? `?category=${encodeURIComponent(cat)}&limit=100` : "";
  const res = await fetch(`${origin}/api/videos${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.videos as Raw[]) ?? [];
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const v = await getById(id);
  if (!v) {
    return (
      <main className="grid h-[100dvh] place-content-center bg-black text-white">
        動画が見つかりません
      </main>
    );
  }
  const list = await getByCategory(v.category);
  // 念のため、同一ID が一覧に無い場合は先頭に差し込む
  const has = list.some((x) => x.id === id);
  const videos = has ? list : [v, ...list];

  return <SwipeViewer videos={videos} initialId={id} />;
}
