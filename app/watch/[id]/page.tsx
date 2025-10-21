// app/watch/[id]/page.tsx
import { headers } from "next/headers";
import VerticalVideo from "@/components/VerticalVideo";

type V = {
  id: string;
  title: string;
  fileUrl: string;
  thumbUrl?: string;
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

async function getVideo(id: string): Promise<V | null> {
  const res = await fetch(
    `${await base()}/api/videos?id=${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return (data.videos?.[0] as V) ?? null;
}

export default async function WatchPage({
  // ★ Next.js 15 では params は Promise なので await が必要
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const v = await getVideo(id);
  if (!v) return <div className="p-6">Not found</div>;

  return (
    <main className="relative h-[100dvh] bg-black">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 mx-auto max-w-md px-3 pt-3">
        <div className="rounded-xl bg-black/40 px-3 py-2 backdrop-blur-md">
          <div className="text-sm font-semibold">{v.title}</div>
          {v.category && <div className="text-[11px] opacity-70">#{v.category}</div>}
        </div>
      </div>

      <section className="mx-auto h-[100dvh] max-w-md flex items-center justify-center px-3">
        <VerticalVideo
          id={v.id}
          fileUrl={v.fileUrl}
          // 空文字が来ても渡さない（/%22%22 404 防止）
          poster={v.thumbUrl || undefined}
        />
      </section>
    </main>
  );
}
