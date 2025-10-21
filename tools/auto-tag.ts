// tools/auto-tag.ts
import "dotenv/config";
import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// --- Firebase Admin init (GOOGLE_APPLICATION_CREDENTIALS か FIREBASE_SERVICE_ACCOUNT を利用) ---
if (!getApps().length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp({ credential: applicationDefault() });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  } else {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT is required");
  }
}
const db = getFirestore();

// ---------- ルール定義（必要に応じて足してください） ----------
type Rule = { test: (p: string) => boolean; tags: string[] };

// パス（storagePath / fileUrl）からの判定
const PATH_RULES: Rule[] = [
  { test: p => /\/job\/nurse\//i.test(p),      tags: ["nurse"] },
  { test: p => /\/job\/suits\//i.test(p),      tags: ["suits"] },
  { test: p => /\/job\/caster\//i.test(p),     tags: ["caster"] },
  { test: p => /\/job\/jk\//i.test(p),         tags: ["jk"] },
  { test: p => /\/job\/gal\//i.test(p),        tags: ["gal"] },
  { test: p => /\/style\/happening\//i.test(p),tags: ["happening"] },
  { test: p => /\/style\/fps\//i.test(p),      tags: ["fps"] },
  { test: p => /\/style\/mazo\//i.test(p),     tags: ["mazo"] },
  { test: p => /\/style\/sado\//i.test(p),     tags: ["sado"] },
  { test: p => /\/style\/etc\//i.test(p),      tags: ["etc"] },
];

// ファイル名のキーワードからの判定
const NAME_RULES: Rule[] = [
  { test: p => /\b(_|-)nurse\b|看護師/i.test(p),     tags: ["nurse"] },
  { test: p => /\b(_|-)suits\b|スーツ/i.test(p),     tags: ["suits"] },
  { test: p => /\b(_|-)caster\b|女子アナ/i.test(p),  tags: ["caster"] },
  { test: p => /\b(_|-)jk\b|JK/i.test(p),            tags: ["jk"] },
  { test: p => /\b(_|-)gal\b|ギャル/i.test(p),       tags: ["gal"] },
  { test: p => /\bfps\b|一人称|POV/i.test(p),        tags: ["fps"] },
  { test: p => /ハプニング|happening/i.test(p),      tags: ["happening"] },
  { test: p => /\bmazo\b|M系/i.test(p),              tags: ["mazo"] },
  { test: p => /\bsado\b|S系/i.test(p),              tags: ["sado"] },
];

// ---------- ヘルパ ----------
function uniqLower(a: string[]) {
  return Array.from(new Set(a.map(s => s.trim().toLowerCase()).filter(Boolean)));
}

function deriveTags(storagePath?: string, fileUrl?: string, title?: string) {
  const target = `${storagePath || ""} ${fileUrl || ""} ${title || ""}`;
  const hits = new Set<string>();
  for (const r of PATH_RULES) if (r.test(target)) r.tags.forEach(t => hits.add(t));
  for (const r of NAME_RULES) if (r.test(target)) r.tags.forEach(t => hits.add(t));
  return uniqLower(Array.from(hits));
}

function same(a?: string[], b?: string[]) {
  const A = uniqLower(a || []);
  const B = uniqLower(b || []);
  return A.length === B.length && A.every((x, i) => x === B[i]);
}

// ---------- メイン ----------
async function main() {
  const args = new Set(process.argv.slice(2));
  const DRY_RUN = args.has("--dry") || args.has("-n");

  const snap = await db.collection("videos").get();
  let changed = 0, skipped = 0;

  for (const doc of snap.docs) {
    const d = doc.data() as any;
    const current = Array.isArray(d.tags) ? uniqLower(d.tags) : [];
    const next = deriveTags(d.storagePath || d.filePath, d.fileUrl, d.title);

    if (!next.length || same(current, next)) {
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log("[dry] ", doc.id, current, "=>", next);
    } else {
      await doc.ref.set({ tags: next }, { merge: true });
      console.log("update:", doc.id, current, "=>", next);
      changed++;
    }
  }

  console.log(`done. docs=${snap.size}, changed=${changed}, skipped=${skipped}, dry=${DRY_RUN}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
