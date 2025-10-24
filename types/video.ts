export type Video = {
  id: string;
  title: string;
  category?: string;
  tags?: string[];
  thumbUrl?: string;
  fileUrl?: string;
  durationSec?: number;
};
export type PlaylistSource =
  | { src: "tag"; slug: string }
  | { src: "category"; slug: string }
  | { src: "section"; key: string }
  | { src: "search"; q: string };
