"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { ensureAuth } from "@/lib/firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function FavoriteButton({ videoId }: { videoId: string }) {
  const [uid, setUid] = useState<string | null>(null);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await ensureAuth(); // 匿名ログイン
      setUid(u);
      const ref = doc(db, "users", u, "favorites", videoId);
      const snap = await getDoc(ref);
      setFav(snap.exists());
    })();
  }, [videoId]);

  async function toggle() {
    if (!uid || busy) return;
    setBusy(true);
    const ref = doc(db, "users", uid, "favorites", videoId);
    if (fav) {
      await deleteDoc(ref);
      setFav(false);
    } else {
      await setDoc(ref, { createdAt: serverTimestamp() });
      setFav(true);
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={!uid || busy}
      className={`absolute right-5 bottom-24 rounded-full px-4 py-2 text-sm font-medium
        ${fav ? "bg-pink-500 text-white" : "bg-white/15"} hover:bg-white/25`}
      aria-pressed={fav}
    >
      {fav ? "♥︎ お気に入り済" : "♡ お気に入り"}
    </button>
  );
}
