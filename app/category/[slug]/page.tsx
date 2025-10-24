// app/category/[slug]/page.tsx
import { headers } from "next/headers";
import VideoThumb from "@/components/VideoThumb";

type V = {
  id: string;
  title: string;
  category: string;
  thumbUrl?: string;
  durationSec?: number;
  fileUrl: string; // 自動サムネ生成に使用
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

async function getByCategory(slug: string): Promise<V[]> {
  const res = await fetch(
    `${await base()}/api/videos?category=${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.videos as V[]) ?? [];
}

export default async function CategoryPage({
  params,
}: {
  // Next.js 15: dynamic route params are a Promise
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const videos = await getByCategory(slug);

  return (
    <main className="mx-auto max-w-md space-y-3 px-3 py-4">
      <div className="rounded-xl bg-black/40 px-3 py-2 backdrop-blur-md">
        <div className="text-sm font-semibold">#{slug}</div>
        <div className="text-[11px] opacity-70">該当 {videos.length} 本</div>
      </div>

      <section className="grid grid-cols-2 gap-4">
        {videos.map((v) => (
          <VideoThumb
            key={v.id}
            id={v.id}
            title={v.title}
            category={v.category}
            thumbUrl={(v.thumbUrl || "").trim() || undefined} // 空文字は未設定扱い
            durationSec={v.durationSec}
            fileUrl={v.fileUrl} // 自動キャプチャ＆キャッシュ用
          />
        ))}

        {videos.length === 0 && (
          <div className="text-sm opacity-70">該当なし</div>
        )}
      </section>
    </main>
  );
}
