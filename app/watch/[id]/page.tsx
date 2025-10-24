import { Suspense } from 'react';
import WatchClient from '../watch-client';
import type { Video } from '@/types/video';
import { listByCategory, listBySearch, listBySection, listByTag } from '@/lib/videosRepo';

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ src?: string; slug?: string; key?: string; q?: string }>;
}) {
  const { id } = await props.params;
  const { src, slug, key, q } = await props.searchParams;

  let items: Video[] = [];

  if (src === 'tag' && slug)           items = await listByTag(slug);
  else if (src === 'category' && slug) items = await listByCategory(slug);
  else if (src === 'section' && key)   items = await listBySection(key);
  else if (src === 'search' && q)      items = await listBySearch(q);
  else {
    // フォールバック：必要なら getVideo(id) 等に差し替え
    items = [];
  }

  if (!id) return <div style={{ padding: 16 }}>Invalid parameters.</div>;

  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      {items.length === 0 ? (
        <div style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>プレイリストが取得できませんでした</h2>
          <div style={{ color: '#666' }}>
            条件: src=<code>{String(src)}</code>
            {slug ? <> / slug=<code>{slug}</code></> : null}
            {key ? <> / key=<code>{key}</code></> : null}
            {q ? <> / q=<code>{q}</code></> : null}
            <br />
            API 応答が 500 の可能性があります。slug や key を別の値で試すか、/api/videos を直接叩いて確認してください。
          </div>
        </div>
      ) : (
        <WatchClient items={items} initialId={String(id)} />
      )}
    </Suspense>
  );
}
