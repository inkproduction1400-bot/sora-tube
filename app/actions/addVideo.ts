// app/actions/addVideo.ts (Server ActionでもAPI RouteでもOK)
import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type NewVideo = {
  title: string;
  category: string;
  tags?: string[];
  fileUrl: string; // Supabase Public URL
  thumbUrl?: string;
  durationSec?: number;
  published?: boolean;
};

export async function addVideo(v: NewVideo) {
  const ref = collection(db, "videos");
  const docRef = await addDoc(ref, {
    title: v.title,
    category: v.category,
    tags: v.tags ?? [],
    fileUrl: v.fileUrl,
    thumbUrl: v.thumbUrl ?? "",
    durationSec: v.durationSec ?? 10,
    views: 0,
    published: v.published ?? true,
    publishedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
