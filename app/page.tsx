// app/page.tsx
import { headers } from "next/headers";
import SiteHeader from "@/components/SiteHeader";
import CategoryPills from "@/components/CategoryPills";
import VideoCard from "@/components/VideoCard";

// 追加：固定バナー
import StickyBottomAd from "@/components/StickyBottomAd";
// （任意）右上フロートを使う場合はコメントアウトを外す
// import FloatingTopRightAd from "@/components/FloatingTopRightAd";

type V = {
  id: string;
  title: string;
  category?: string;
  thumbUrl?: string;
  durationSec?: number;
  fileUrl: string;
};

const JOB_CATEGORIES = [
  { key: "nurse", label: "看護師", href: "/c/job/nurse" },
  { key: "suits", label: "スーツ", href: "/c/job/suits" },
  { key: "caster", label: "女子アナ", href: "/c/job/caster" },
  { key: "jk", label: "JK", href: "/c/job/jk" },
  { key: "gal", label: "ギャル", href: "/c/job/gal" },
];

const STYLE_CATEGORIES = [
  { key: "happening", label: "ハプニング系", href: "/c/style/happening" },
  { key: "fps", label: "一人称視点", href: "/c/style/fps" },
  { key: "mazo", label: "M系", href: "/c/style/mazo" },
  { key: "sado", label: "S系", href: "/c/style/sado" },
  { key: "etc", label: "その他", href: "/c/style/etc" },
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

/** 共通フェッチ（/api/videos にそのまま渡す） */
async function getVideos(params?: Record<string, string>): Promise<V[]> {
  const origin = await base();
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  const res = await fetch(`${origin}/api/videos${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.videos as V[]) ?? [];
}

/** セクションAPI（recommended/latest/recent など） */
const getSection = (key: string, limit = "6") =>
  getVideos({ src: "section", key, limit });

/** カテゴリAPI（職業/スタイルなど） */
const getCategory = (slug: string, limit = "6") =>
  getVideos({ src: "category", slug, limit });

export default async function HomePage() {
  // 主要2セクション（おすすめ / 新作）
  const [recommended, latest] = await Promise.all([
    getSection("recommended", "6"),
    getSection("latest", "6"),
  ]);

  // 新カテゴリに合わせた取得（職業/スタイル）
  const [nurse, suits, caster, jk, gal, happening, fps, mazo, sado, etcCat] =
    await Promise.all([
      getCategory("nurse", "6"),
      getCategory("suits", "6"),
      getCategory("caster", "6"),
      getCategory("jk", "6"),
      getCategory("gal", "6"),
      getCategory("happening", "6"),
      getCategory("fps", "6"),
      getCategory("mazo", "6"),
      getCategory("sado", "6"),
      getCategory("etc", "6"),
    ]);

  const nothing =
    (recommended?.length ?? 0) +
      (latest?.length ?? 0) +
      (nurse?.length ?? 0) +
      (suits?.length ?? 0) +
      (caster?.length ?? 0) +
      (jk?.length ?? 0) +
      (gal?.length ?? 0) +
      (happening?.length ?? 0) +
      (fps?.length ?? 0) +
      (mazo?.length ?? 0) +
      (sado?.length ?? 0) +
      (etcCat?.length ?? 0) ===
    0;

  // 「もっと→」は共通プレイヤーへ（先頭IDがある場合のみ）
  const moreRecommended =
    recommended[0]?.id
      ? `/watch/${recommended[0].id}?src=section&key=recommended`
      : "/search?tab=recommended";
  const moreLatest =
    latest[0]?.id
      ? `/watch/${latest[0].id}?src=section&key=latest`
      : "/search?tab=latest";
  const moreNurse =
    nurse[0]?.id ? `/watch/${nurse[0].id}?src=category&slug=nurse` : "/c/job/nurse";
  const moreSuits =
    suits[0]?.id ? `/watch/${suits[0].id}?src=category&slug=suits` : "/c/job/suits";
  const moreCaster =
    caster[0]?.id ? `/watch/${caster[0].id}?src=category&slug=caster` : "/c/job/caster";
  const moreJk =
    jk[0]?.id ? `/watch/${jk[0].id}?src=category&slug=jk` : "/c/job/jk";
  const moreGal =
    gal[0]?.id ? `/watch/${gal[0].id}?src=category&slug=gal` : "/c/job/gal";
  const moreHappening =
    happening[0]?.id
      ? `/watch/${happening[0].id}?src=category&slug=happening`
      : "/c/style/happening";
  const moreFps =
    fps[0]?.id ? `/watch/${fps[0].id}?src=category&slug=fps` : "/c/style/fps";
  const moreMazo =
    mazo[0]?.id ? `/watch/${mazo[0].id}?src=category&slug=mazo` : "/c/style/mazo";
  const moreSado =
    sado[0]?.id ? `/watch/${sado[0].id}?src=category&slug=sado` : "/c/style/sado";
  const moreEtc =
    etcCat[0]?.id ? `/watch/${etcCat[0].id}?src=category&slug=etc` : "/c/style/etc";

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <SiteHeader />

      <div className="mx-auto w-full max-w-md px-3 pb-16">
        {/* 検索窓の直下にカテゴリーPills（職業別／スタイル） */}
        <div className="mt-2 space-y-2">
          <CategoryPills items={JOB_CATEGORIES} />
          <CategoryPills items={STYLE_CATEGORIES} />
        </div>

        {/* あなたにおすすめ（section=recommended） */}
        <SectionHeader title="あなたにおすすめ" moreHref={moreRecommended} />
        <ThumbGrid videos={recommended} />

        {/* 新作（section=latest） */}
        <SectionHeader title="新作" moreHref={moreLatest} />
        <ThumbGrid videos={latest} />

        {/* 職業別 */}
        <SectionHeader title="職業別：看護師" moreHref={moreNurse} />
        <ThumbGrid videos={nurse} />

        <SectionHeader title="職業別：スーツ" moreHref={moreSuits} />
        <ThumbGrid videos={suits} />

        <SectionHeader title="職業別：女子アナ" moreHref={moreCaster} />
        <ThumbGrid videos={caster} />

        <SectionHeader title="職業別：JK" moreHref={moreJk} />
        <ThumbGrid videos={jk} />

        <SectionHeader title="職業別：ギャル" moreHref={moreGal} />
        <ThumbGrid videos={gal} />

        {/* スタイル別 */}
        <SectionHeader title="動画スタイル：ハプニング系" moreHref={moreHappening} />
        <ThumbGrid videos={happening} />

        <SectionHeader title="動画スタイル：一人称視点" moreHref={moreFps} />
        <ThumbGrid videos={fps} />

        <SectionHeader title="動画スタイル：M系" moreHref={moreMazo} />
        <ThumbGrid videos={mazo} />

        <SectionHeader title="動画スタイル：S系" moreHref={moreSado} />
        <ThumbGrid videos={sado} />

        <SectionHeader title="動画スタイル：その他" moreHref={moreEtc} />
        <ThumbGrid videos={etcCat} />

        {nothing && (
          <div className="py-10 text-center text-sm opacity-70">
            まだ動画がありません
          </div>
        )}
      </div>

      {/* 固定広告（ページ最下部・常時） */}
      <StickyBottomAd />
      {/* 右上フロートを出すなら↓を有効化 */}
      {/* <FloatingTopRightAd /> */}
    </main>
  );
}

function SectionHeader({
  title,
  moreHref,
}: {
  title: string;
  moreHref: string;
}) {
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
