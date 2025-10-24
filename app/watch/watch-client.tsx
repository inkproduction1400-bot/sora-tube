'use client';
import { useMemo } from 'react';
import SwipeViewer from '@/components/SwipeViewer';
import type { Video } from '@/types/video';

type AdSlot = { __ad__: true; key: string };
type Item = Video | AdSlot;

function isAdSlot(x: Item): x is AdSlot {
  return typeof x === 'object' && x !== null && '__ad__' in x;
}

export default function WatchClient({ items, initialId }: { items: Video[]; initialId: string }) {
  const list: Item[] = useMemo(() => {
    const out: Item[] = [];
    items.forEach((v, i) => {
      out.push(v);
      if ((i + 1) % 3 === 0) out.push({ __ad__: true, key: `ad-${i}` });
    });
    return out;
  }, [items]);

  const videosOnly: Video[] = list.filter((it): it is Video => !isAdSlot(it));

  // SwipeViewer の props 型を取得して、安全に型を合わせる
  type SwipeViewerProps = React.ComponentProps<typeof SwipeViewer>;
  const videosProp = videosOnly as unknown as SwipeViewerProps['videos'];

  return <SwipeViewer videos={videosProp} initialId={initialId} />;
}
