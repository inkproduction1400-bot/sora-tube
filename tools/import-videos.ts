// tools/import-videos.ts
import fs from "node:fs";
import * as dotenv from "dotenv";

// .env.local があれば優先、無ければ .env を読む
dotenv.config({ path: fs.existsSync(".env.local") ? ".env.local" : ".env" });

import { createClient } from "@supabase/supabase-js";
import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/* =========================
   Firebase Admin init
   ========================= */
if (!getApps().length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // 例: GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
    initializeApp({ credential: applicationDefault() });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // 例: FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}（1行JSON）
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  } else {
    throw new Error(
      "Missing credentials: set GOOGLE_APPLICATION_CREDENTIALS (path) or FIREBASE_SERVICE_ACCOUNT (inline JSON)."
    );
  }
}
const db = getFirestore();

/* =========================
   Supabase client
   ========================= */
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL) throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required.");
if (!SUPABASE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required (service role).");

const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

/* =========================
   設定とヘルパ
   ========================= */
const BUCKET = process.env.IMPORT_BUCKET || "videos";

// prefix 正規化（先頭/末尾スラ削除 & バケット名を外す）
function normalizePrefix(p?: string) {
  let s = (p || "").trim().replace(/^\/+|\/+$/g, "");
  if (!s) return "";
  if (s === BUCKET) return ""; // "videos" → root
  if (s.startsWith(BUCKET + "/")) s = s.slice(BUCKET.length + 1); // "videos/job" → "job"
  return s;
}
// 既定は “バケット直下から全再帰”
const ROOT_PREFIX = normalizePrefix(process.env.IMPORT_PREFIX);

// 公開URLを作る
function publicUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_BASE ||
    `${SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/public/${BUCKET}`;
  return `${base}/${path.replace(/^\/+/, "")}`;
}

/** パス/ファイル名から tags を自動抽出 */
function deriveTagsFromPath(filePath: string) {
  const tags = new Set<string>();

  // 例: job/caster/caster12.mp4 → "caster"
  const m1 = filePath.match(/\/job\/([a-z0-9_-]+)\//i);
  if (m1) tags.add(m1[1].toLowerCase());

  // 例: style/fps/fps03.mp4 → "fps"
  const m2 = filePath.match(/\/style\/([a-z0-9_-]+)\//i);
  if (m2) tags.add(m2[1].toLowerCase());

  // 例: caster12.mp4 / jk3.mp4 / suits8.mov → 先頭の英字部分をタグに
  const base = filePath.split("/").pop() || "";
  const m3 = base.match(/^([a-z]+)[\d_-]*\.(mp4|mov|m4v)$/i);
  if (m3) tags.add(m3[1].toLowerCase());

  return Array.from(tags);
}

/** Supabase Storage を再帰的に走査してファイルパス一覧を返す（デバッグログ付き） */
async function listAllFiles(prefix: string): Promise<string[]> {
  const files: string[] = [];
  const stack: string[] = [prefix.replace(/^\/+|\/+$/g, "")]; // "" なら root

  while (stack.length) {
    const cur = stack.pop()!;
    let offset = 0;
    const limit = 100;

    for (;;) {
      // cur === "" のときは undefined を渡す → バケット直下を列挙
      const { data, error } = await supa.storage.from(BUCKET).list(cur || undefined, {
        limit,
        offset,
      });
      if (error) throw error;

      const count = data?.length ?? 0;
      console.log(`  [list] dir="${cur || "/"}" -> ${count} items (offset=${offset})`);
      if (!data || count === 0) break;

      for (const entry of data) {
        // フォルダ判定強化:
        // - Supabase はフォルダで id=null / metadata=null なことが多い
        // - かつ拡張子でファイル推定
        const looksLikeFile = /\.(mp4|mov|m4v)$/i.test(entry.name);
        const isFolder = entry.id === null || (entry.metadata == null && !looksLikeFile);

        if (isFolder) {
          const next = (cur ? `${cur}/` : "") + entry.name;
          stack.push(next);
        } else {
          const path = (cur ? `${cur}/` : "") + entry.name;
          files.push(path);
        }
      }

      if (count < limit) break;
      offset += limit;
    }
  }

  return files;
}

async function main() {
  console.log("[import] bucket =", BUCKET, "prefix =", ROOT_PREFIX || "(root)");

  // 再帰で全ファイル収集
  const allPaths = await listAllFiles(ROOT_PREFIX);
  let imported = 0;

  for (const filePath of allPaths) {
    if (!/\.((mp4)|(mov)|(m4v))$/i.test(filePath)) continue;

    // ドキュメントIDはパス由来で安定化
    const docId = filePath.replace(/[^\w-]+/g, "_");
    const ref = db.collection("videos").doc(docId);

    const baseName = filePath.split("/").pop() || "untitled";
    const title = baseName.replace(/\.[^.]+$/, "") || "untitled";
    const tags = deriveTagsFromPath(filePath);

    const payload = {
      title,
      fileUrl: publicUrl(filePath),
      filePath,              // API 側で補完に使う
      storagePath: filePath, // 互換
      published: true,
      publishedAt: new Date(),
      thumbUrl: "",
      // 既存の durationSec は merge で保持
      tags,
    };

    await ref.set(payload, { merge: true });
    imported++;
    console.log("upsert:", docId, "tags:", tags.join(",") || "(none)");
  }

  console.log(`done. files=${allPaths.length}, imported=${imported}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
