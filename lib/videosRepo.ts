// lib/videosRepo.ts
import type { Video } from '@/types/video';
import { headers } from 'next/headers';

type ApiResp = { items?: unknown; videos?: unknown };

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}
function isVideo(x: unknown): x is Video {
  if (!isRecord(x)) return false;
  const rec = x as Record<string, unknown>;
  return typeof rec.id === 'string';
}
function toVideoArray(x: unknown): Video[] {
  if (!Array.isArray(x)) return [];
  return x.filter(isVideo);
}

/** Server でも確実に使える BASE を取得（Next 15: headers() が Promise のため await 必須） */
async function getBase(): Promise<string> {
  try {
    const h = await headers(); // ← ここが重要（Promise<ReadonlyHeaders>）
    const forwardedProto = h.get('x-forwarded-proto') ?? undefined;
    const forwardedHost  = h.get('x-forwarded-host') ?? undefined;
    const host  = forwardedHost ?? h.get('host') ?? 'localhost:3001';
    const proto = forwardedProto ?? 'http';
    const envBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
    return envBase && /^https?:\/\//.test(envBase) ? envBase : `${proto}://${host}`;
  } catch {
    // headers() が使えない状況（クライアント or 非SSR）でも落とさない
    return process.env.NEXT_PUBLIC_BASE_URL?.trim() || 'http://localhost:3001';
  }
}

async function getJson(pathOrUrl: string): Promise<unknown> {
  try {
    const base = pathOrUrl.startsWith('http') ? '' : await getBase();
    const abs = `${base}${pathOrUrl}`;
    const res = await fetch(abs, { cache: 'no-store' });
    if (!res.ok) {
      console.error('[videosRepo] fetch failed', abs, res.status);
      return {};
    }
    return await res.json();
  } catch (e) {
    console.error('[videosRepo] exception', pathOrUrl, e);
    return {};
  }
}

async function fetchVideos(pathOrUrl: string): Promise<Video[]> {
  const data = await getJson(pathOrUrl);
  if (isRecord(data)) {
    const items  = 'items'  in data ? toVideoArray((data as ApiResp).items)  : [];
    const videos = 'videos' in data ? toVideoArray((data as ApiResp).videos) : [];
    const out = items.length ? items : videos;
    // 必須の可能性があるフィールドを最低限補完
    return out.map((v) => ({
      ...v,
      fileUrl: v.fileUrl ?? '',
      thumbUrl: v.thumbUrl ?? '',
    }));
  }
  return [];
}

/** テンプレ文字列の代わりに安全にクエリを組む */
function withQuery(path: string, params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') usp.set(k, v);
  }
  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function listByTag(slug: string): Promise<Video[]> {
  const url = withQuery('/api/videos', { src: 'tag', slug });
  return fetchVideos(url);
}
export async function listByCategory(slug: string): Promise<Video[]> {
  const url = withQuery('/api/videos', { src: 'category', slug });
  return fetchVideos(url);
}
export async function listBySection(key: string): Promise<Video[]> {
  const url = withQuery('/api/videos', { src: 'section', key });
  return fetchVideos(url);
}
export async function listBySearch(q: string): Promise<Video[]> {
  const url = withQuery('/api/videos', { src: 'search', q });
  return fetchVideos(url);
}
