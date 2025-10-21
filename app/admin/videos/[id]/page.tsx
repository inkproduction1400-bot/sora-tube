// app/admin/videos/[id]/page.tsx
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import AdminVideoEditor from "@/components/AdminVideoEditor";

type V = {
  id: string;
  title: string;
  category?: string;
  thumbUrl?: string;
  durationSec?: number;
  fileUrl: string;
  tags?: string[];
  published?: boolean;
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
  const origin = await base();
  const res = await fetch(`${origin}/api/videos?id=${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.videos?.[0] as V) ?? null;
}

export default async function AdminVideoPage({
  params,
}: {
  params: { id: string };
}) {
  const v = await getVideo(params.id);
  if (!v) notFound();

  return (
    <main className="mx-auto max-w-2xl p-6 text-white">
      <h1 className="mb-4 text-2xl font-bold">動画を編集: {v.title}</h1>
      <AdminVideoEditor initial={v} />
    </main>
  );
}
