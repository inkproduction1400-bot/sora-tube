// app/watch/[id]/page.tsx
import SwipeViewer from "@/components/SwipeViewer";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

type V = {
  id: string;
  title: string;
  fileUrl: string;
  thumbUrl?: string;
  durationSec?: number;
  category?: string;
};

const JOB_TAGS = new Set(["nurse", "suits", "caster", "jk", "gal"]);

async function base() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "");
  return `${proto}://${host}`;
}

async function getVideoById(id: string): Promise<V | null> {
  const origin = await base();
  const res = await fetch(`${origin}/api/videos?id=${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  const v = (data?.videos as V[] | undefined)?.[0];
  return v ?? null;
}

async function getVideosByCategory(cat: string, limit = 60): Promise<V[]> {
  const origin = await base();
  const res = await fetch(
    `${origin}/api/videos?${new URLSearchParams({ category: cat, limit: String(limit) })}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.videos as V[]) ?? [];
}

export default async function WatchPage({ params }: { params: { id: string } }) {
  const current = await getVideoById(params.id);
  if (!current) return notFound();

  const tag = (current.category || "").trim().toLowerCase();
  const group = JOB_TAGS.has(tag) ? "job" : "style";

  // 同カテゴリでスワイプ再生（広告は SwipeViewer 側で自動挿入）
  let list = tag ? await getVideosByCategory(tag, 60) : [current];

  // APIの整列で対象が先頭に来ない場合があるので、存在保障
  if (!list.find((v) => v.id === current.id)) {
    list = [current, ...list];
  }

  return (
    <div className="relative h-[100dvh] w-full bg-black text-white">
      {/* SwipeViewer: これで3本ごとの広告が効く */}
      <SwipeViewer videos={list} initialId={current.id} />
    </div>
  );
}
