// app/search/page.tsx
import { headers } from "next/headers";
import VerticalSwipePlayer from "@/components/VerticalSwipePlayer";

type V = {
  id: string;
  title: string;
  category?: string;
  thumbUrl?: string;
  durationSec?: number;
  fileUrl: string;
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

async function getVideos(params?: Record<string, string>): Promise<V[]> {
  const origin = await base();
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  const res = await fetch(`${origin}/api/videos${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.videos as V[]) ?? [];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // 互換：?tab=recommended / ?category=nurse など、どちらも受ける
  const category =
    (typeof searchParams.category === "string" && searchParams.category) ||
    (typeof searchParams.tab === "string" && searchParams.tab) ||
    undefined;

  const videos = await getVideos(
    category ? { category, limit: "50" } : { limit: "50" }
  );

  return (
    <main className="h-[100dvh] w-full bg-black text-white">
      <VerticalSwipePlayer videos={videos} startIndex={0} />
    </main>
  );
}
