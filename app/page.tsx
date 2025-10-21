// app/page.tsx
import { headers } from "next/headers";
import SiteHeader from "@/components/SiteHeader";
import CategoryPills from "@/components/CategoryPills";
import VideoCard from "@/components/VideoCard";

type V = {
  id: string;
  title: string;
  category?: string;
  thumbUrl?: string;
  durationSec?: number;
  fileUrl: string;
};

const JOB_CATEGORIES = [
  { key: "nurse",  label: "看護師",   href: "/c/job/nurse" },
  { key: "suits",  label: "スーツ",   href: "/c/job/suits" },
  { key: "caster", label: "女子アナ", href: "/c/job/caster" },
  { key: "jk",     label: "JK",       href: "/c/job/jk" },
  { key: "gal",    label: "ギャル",   href: "/c/job/gal" },
];

const STYLE_CATEGORIES = [
  { key: "happening", label: "ハプニング系",  href: "/c/style/happening" },
  { key: "fps",       label: "一人称視点",    href: "/c/style/fps" },
  { key: "mazo",      label: "M系",          href: "/c/style/mazo" },
  { key: "sado",      label: "S系",          href: "/c/style/sado" },
  { key: "etc",       label: "その他",        href: "/c/style/etc" },
];

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

export default async function HomePage() {
  // 主要3セクション
  const [recommended, latest, recent] = await Promise.all([
    getVideos({ category: "recommended", limit: "6" }),
    getVideos({ category: "latest",      limit: "6" }),
    getVideos({ category: "recent",      limit: "6" }),
  ]);

  // 新カテゴリに合わせた取得
  const [
    nurse, suits, caster, jk, gal,
    happening, fps, mazo, sado, etcCat
  ] = await Promise.all([
    getVideos({ category: "nurse",     limit: "6" }),
    getVideos({ category: "suits",     limit: "6" }),
    getVideos({ category: "caster",    limit: "6" }),
    getVideos({ category: "jk",        limit: "6" }),
    getVideos({ category: "gal",       limit: "6" }),
    getVideos({ category: "happening", limit: "6" }),
    getVideos({ category: "fps",       limit: "6" }),
    getVideos({ category: "mazo",      limit: "6" }),
    getVideos({ category: "sado",      limit: "6" }),
    getVideos({ category: "etc",       limit: "6" }),
  ]);

  const nothing =
    (recommended?.length ?? 0) +
    (latest?.length ?? 0) +
    (recent?.length ?? 0) +
    (nurse?.length ?? 0) +
    (suits?.length ?? 0) +
    (caster?.length ?? 0) +
    (jk?.length ?? 0) +
    (gal?.length ?? 0) +
    (happening?.length ?? 0) +
    (fps?.length ?? 0) +
    (mazo?.length ?? 0) +
    (sado?.length ?? 0) +
    (etcCat?.length ?? 0) === 0;

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <SiteHeader />

      <div className="mx-auto w-full max-w-md px-3 pb-16">
        {/* 検索窓の直下にカテゴリーPills（職業別／スタイル） */}
        <div className="mt-2 space-y-2">
          <CategoryPills items={JOB_CATEGORIES} />
          <CategoryPills items={STYLE_CATEGORIES} />
        </div>

        {/* あなたにおすすめ */}
        <SectionHeader title="あなたにおすすめ" moreHref="/search?tab=recommended" />
        <ThumbGrid videos={recommended} />

        {/* 新作 */}
        <SectionHeader title="新作" moreHref="/search?tab=latest" />
        <ThumbGrid videos={latest} />

        {/* 職業別 */}
        <SectionHeader title="職業別：看護師" moreHref="/c/job/nurse" />
        <ThumbGrid videos={nurse} />

        <SectionHeader title="職業別：スーツ" moreHref="/c/job/suits" />
        <ThumbGrid videos={suits} />

        <SectionHeader title="職業別：女子アナ" moreHref="/c/job/caster" />
        <ThumbGrid videos={caster} />

        <SectionHeader title="職業別：JK" moreHref="/c/job/jk" />
        <ThumbGrid videos={jk} />

        <SectionHeader title="職業別：ギャル" moreHref="/c/job/gal" />
        <ThumbGrid videos={gal} />

        {/* スタイル別 */}
        <SectionHeader title="動画スタイル：ハプニング系" moreHref="/c/style/happening" />
        <ThumbGrid videos={happening} />

        <SectionHeader title="動画スタイル：一人称視点" moreHref="/c/style/fps" />
        <ThumbGrid videos={fps} />

        <SectionHeader title="動画スタイル：M系" moreHref="/c/style/mazo" />
        <ThumbGrid videos={mazo} />

        <SectionHeader title="動画スタイル：S系" moreHref="/c/style/sado" />
        <ThumbGrid videos={sado} />

        <SectionHeader title="動画スタイル：その他" moreHref="/c/style/etc" />
        <ThumbGrid videos={etcCat} />

        {nothing && (
          <div className="py-10 text-center text-sm opacity-70">
            まだ動画がありません
          </div>
        )}
      </div>
    </main>
  );
}

function SectionHeader({ title, moreHref }: { title: string; moreHref: string }) {
  return (
    <div className="mb-3 mt-5 flex items-center justify-between">
      <h2 className="text-[22px] font-extrabold tracking-wide">{title}</h2>
      <a
        href={moreHref}
        className="rounded-xl bg-white/10 px-3 py-1 text-sm hover:bg-white/15"
      >
        もっと →
      </a>
    </div>
  );
}

function ThumbGrid({ videos }: { videos: V[] }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 opacity-60">
        {/* skeleton を必要なら追加 */}
      </div>
    );
  }

  return (
    <section className="grid grid-cols-2 gap-4">
      {videos.map((v) => (
        <VideoCard key={v.id} v={v} />
      ))}
    </section>
  );
}
