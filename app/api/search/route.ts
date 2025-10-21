// app/api/search/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  limit,
} from "firebase/firestore";

export const dynamic = "force-dynamic"; // キャッシュ抑止（開発向け）

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qText = (url.searchParams.get("q") ?? "").trim();
  const tag = (url.searchParams.get("tag") ?? "").trim();

  const ref = collection(db, "videos");
  let q;

  if (tag) {
    q = query(
      ref,
      where("published", "==", true),
      where("tags", "array-contains", tag),
      orderBy("publishedAt", "desc"),
      limit(30)
    );
  } else if (qText) {
    q = query(
      ref,
      where("published", "==", true),
      orderBy("title"),
      startAt(qText),
      endAt(qText + "\uf8ff"),
      limit(30)
    );
  } else {
    q = query(
      ref,
      where("published", "==", true),
      orderBy("publishedAt", "desc"),
      limit(30)
    );
  }

  const snap = await getDocs(q);
  const videos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ videos });
}
