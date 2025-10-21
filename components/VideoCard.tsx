// components/VideoCard.tsx
import Link from "next/link";
import VideoThumb from "@/components/VideoThumb";

type V = {
  id: string;
  title: string;
  fileUrl: string;
  thumbUrl?: string;
  durationSec?: number;
  category?: string;

  // ▼ 追加: 広告対応
  type?: "video" | "ad";
  targetUrl?: string; // type==='ad' のときの遷移先
};

const JOB_TAGS = new Set(["nurse","suits","caster","jk","gal"]); // ← app/page.tsx と揃える

function fmtDur(s?: number) {
  if (!s && s !== 0) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`
    : `${m}:${ss.toString().padStart(2, "0")}`;
}

function buildSwipeHref(v: V) {
  const tag = (v.category || "").trim().toLowerCase();
  if (!tag) return `/c/recommended?v=${encodeURIComponent(v.id)}`;
  const group = JOB_TAGS.has(tag) ? "job" : "style";
  return `/c/${group}/${encodeURIComponent(tag)}?v=${encodeURIComponent(v.id)}`;
}

export default function VideoCard({ v }: { v: V }) {
  const isAd = v.type === "ad" && !!v.targetUrl;
  const durationLabel = !isAd ? fmtDur(v.durationSec ?? undefined) : null;

  // 内部（スワイプビュー） or 外部（PRリンク）を切り替え
  const internalHref = buildSwipeHref(v);
  const externalHref = v.targetUrl || "#";

  const CardInner = (
    <article
      className="rounded-xl border border-slate-200/70 bg-white shadow-sm transition
                 hover:shadow-md dark:border-slate-800 dark:bg-slate-900
                 focus-within:ring-2 focus-within:ring-blue-500/60"
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-t-xl bg-black">
        <div className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]">
          {/* VideoThumb は見た目のみ（アンカーはここで包む） */}
          <VideoThumb
            id={v.id}
            title={v.title}
            category={v.category}
            thumbUrl={(v.thumbUrl || "").trim() || undefined}
            durationSec={v.durationSec}
            fileUrl={v.fileUrl}
          />
        </div>

        {/* バッジ類 */}
        {isAd ? (
          <div className="absolute left-2 top-2 rounded-md bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-black">
            PR
          </div>
        ) : (
          durationLabel && (
            <div
              className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5
                         text-[11px] font-semibold text-white"
              aria-label={`再生時間 ${durationLabel}`}
            >
              {durationLabel}
            </div>
          )
        )}
      </div>

      <div className="px-3 py-2">
        <h3 className="text-[13px] leading-tight line-clamp-2">{v.title}</h3>

        {isAd ? (
          <div className="mt-1 text-[11px] opacity-80">スポンサー</div>
        ) : v.category ? (
          <div className="mt-1">
            <span
              className="inline-flex items-center rounded px-2 py-0.5 text-[11px]
                         bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {v.category}
            </span>
          </div>
        ) : (
          <div className="mt-1 text-[11px] opacity-60">&nbsp;</div>
        )}
      </div>
    </article>
  );

  // 外部PRは <a>、通常動画は <Link>
  return isAd ? (
    <a
      href={externalHref}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group block outline-none"
      aria-label={`${v.title} を開く（広告）`}
      title={v.title}
    >
      {CardInner}
    </a>
  ) : (
    <Link
      href={internalHref}
      prefetch
      className="group block outline-none"
      aria-label={`${v.title} を再生`}
      title={v.title}
    >
      {CardInner}
    </Link>
  );
}
