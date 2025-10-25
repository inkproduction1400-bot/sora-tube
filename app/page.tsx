// app/page.tsx
import { headers } from "next/headers";
import SiteHeader from "@/components/SiteHeader";
import CategoryPills from "@/components/CategoryPills";
import VideoCard from "@/components/VideoCard";

// 置き換え：カード間は 320x100 生タグを使う共通ローダ
import FC2BannerInline from "@/components/FC2BannerInline";

// 固定バナー（FC2版）
import StickyBottomFC2 from "@/components/StickyBottomFC2";
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

async function getVideos(params?: Record<string, string>): Promise<V[]> {
  const origin = await base();
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  const res = await fetch(`${origin}/api/videos${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.videos as V[]) ?? [];
}

const getSection = (key: string, limit = "6") =>
  getVideos({ src: "section", key, limit });
const getCategory = (slug: string, limit = "6") =>
  getVideos({ src: "category", slug, limit });

export default async function HomePage() {
  const [recommended, latest] = await Promise.all([
    getSection("recommended", "6"),
    getSection("latest", "6"),
  ]);

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
        <div className="mt-2 space-y-2">
          <CategoryPills items={JOB_CATEGORIES} />
          <CategoryPills items={STYLE_CATEGORIES} />
        </div>

        <SectionHeader title="あなたにおすすめ" moreHref={moreRecommended} />
        <ThumbGrid videos={recommended} />

        <SectionHeader title="新作" moreHref={moreLatest} />
        <ThumbGrid videos={latest} />

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

      {/* 固定広告（ページ最下部・常時 / FC2） */}
      <StickyBottomFC2 />
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

// ★ 2枚ごとに FC2 320x100 を1枠（行全幅で挿入）
function ThumbGrid({ videos }: { videos: V[] }) {
  if (!videos || videos.length === 0) {
    return <div className="grid grid-cols-2 gap-4 opacity-60" />;
  }

  const FREQ = 2;

  const items: React.ReactNode[] = [];
  videos.forEach((v, i) => {
    if (i > 0 && i % FREQ === 0) {
      items.push(
        <div key={`fc2-${i}`} className="col-span-2">
          {/* 生タグは NEXT_PUBLIC_FC2_TAG_320x50 に保存（320x100タグを格納） */}
          <FC2BannerInline variant="320x50" reserveMinPx={110} />
        </div>,
      );
    }
    items.push(<VideoCard key={v.id} v={v} />);
  });

  return <section className="grid grid-cols-2 gap-4">{items}</section>;
}
