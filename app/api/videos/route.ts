// app/api/videos/route.ts
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as qlimit,
  addDoc,
  setDoc,
  type QueryConstraint,
} from "firebase/firestore";
import { NextResponse } from "next/server";

const nz = (s?: string) => (s && s.trim() ? s.trim() : undefined);

type Raw = {
  title?: string;
  category?: string;
  tags?: string[];
  thumbUrl?: string;
  durationSec?: number;
  /** Firestore に fileUrl がそのまま入っている場合 */
  fileUrl?: string;
  /** Firestore にストレージ上のパスのみを入れている場合（例: videos/abc/download.mp4） */
  filePath?: string;
  published?: boolean;
  publishedAt?: unknown;

  /** ▼ 追加: ネイティブ広告等の識別・遷移先 ▼ */
  type?: string;      // 'video' | 'ad'（省略時は 'video' として扱う）
  targetUrl?: string; // type==='ad' のときの遷移先
};

type Shaped = {
  id: string;
  title: string;
  category?: string;
  thumbUrl?: string;
  durationSec?: number;
  fileUrl?: string;
  /** 広告用 */
  type: string;       // 'video' | 'ad'
  targetUrl?: string;
};

/* =========================
   Supabase公開URLの補完ヘルパ
   ========================= */

function buildPublicUrl(rawUrl?: string, rawPath?: string) {
  const url = nz(rawUrl);
  if (url) return url;

  const path = nz(rawPath);
  if (!path) return undefined;

  const directBase = nz(process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_BASE);
  if (directBase) {
    return `${directBase.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  }

  const supa = nz(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const bucket = nz(process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_BUCKET);
  if (supa && bucket) {
    return `${supa.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${path.replace(/^\/+/, "")}`;
  }
  return undefined;
}

/** Firestore → API返却形 */
function shape(id: string, v: Raw): Shaped {
  const title = v.title ?? "";
  const category = nz(v.category) ?? nz(v.tags?.[0]);
  const thumbUrl = nz(v.thumbUrl);
  const durationSec =
    typeof v.durationSec === "number" && isFinite(v.durationSec)
      ? v.durationSec
      : undefined;

  const fileUrl = buildPublicUrl(v.fileUrl, v.filePath);

  const type = nz(v.type) ?? "video";
  const targetUrl = nz(v.targetUrl);

  return { id, title, category, thumbUrl, durationSec, fileUrl, type, targetUrl };
}

/* =========================
   認可（簡易）＆ユーティリティ
   ========================= */
function checkAdminKey(req: Request) {
  const need = nz(process.env.ADMIN_API_KEY);
  if (!need) return true;
  const got = req.headers.get("x-admin-key") ?? "";
  return got === need;
}

function normalizeTags(val: unknown): string[] | undefined {
  if (val === undefined || val === null) return undefined;
  const arr = Array.isArray(val) ? val : typeof val === "string" ? val.split(/[,\s]+/) : [];
  const out = Array.from(
    new Set(arr.map((t) => String(t ?? "").trim().toLowerCase()).filter(Boolean))
  ).slice(0, 20);
  return out;
}

function parsePublishedAt(val: unknown): Date | undefined {
  if (!val) return undefined;
  if (typeof val === "string" || typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }
  // Firestore Timestamp はここでは触らず undefined を返してスキップ
  return undefined;
}

/* =========================
   GET
   ========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") ?? undefined;
    const category = nz(searchParams.get("category") ?? undefined);

    const limitParam = Number(searchParams.get("limit") ?? "24");
    const lim =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(100, Math.max(1, Math.floor(limitParam)))
        : 24;

    if (id) {
      const snap = await getDoc(doc(db, "videos", id));
      if (!snap.exists()) {
        return NextResponse.json({ videos: [] }, { status: 200, headers: { "Cache-Control": "no-store" } });
      }
      const v = snap.data() as Raw;
      return NextResponse.json({ videos: [shape(snap.id, v)] }, { status: 200, headers: { "Cache-Control": "no-store" } });
    }

    const ref = collection(db, "videos");
    const constraints: QueryConstraint[] = [
      where("published", "==", true),
      orderBy("publishedAt", "desc"),
      qlimit(lim),
    ];

    if (category) {
      const pseudoTabs = new Set(["recommended", "latest", "recent"]);
      if (!pseudoTabs.has(category)) {
        constraints.unshift(where("tags", "array-contains", category));
      }
    }

    const qy = query(ref, ...constraints);
    const snap = await getDocs(qy);
    const data = snap.docs.map((d) => shape(d.id, d.data() as Raw));

    return NextResponse.json({ videos: data }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("GET /api/videos error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

/* =========================
   PUT（部分更新）
   ========================= */
export async function PUT(req: Request) {
  try {
    if (!checkAdminKey(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const body = (await req.json().catch(() => ({}))) as Partial<Raw> & { id?: string };
    const id = body.id || new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

    const patch: Partial<Raw> & { publishedAt?: Date } = {};
    if (typeof body.title === "string") patch.title = body.title.trim();
    if (typeof body.fileUrl === "string") patch.fileUrl = body.fileUrl.trim();
    if (typeof body.filePath === "string") patch.filePath = body.filePath.trim();
    if (typeof body.thumbUrl === "string") patch.thumbUrl = body.thumbUrl.trim();
    if (typeof body.category === "string") patch.category = body.category.trim();
    if (typeof body.durationSec === "number" && isFinite(body.durationSec)) patch.durationSec = Math.floor(body.durationSec);
    if (typeof body.published === "boolean") patch.published = body.published;

    // 広告用
    if (typeof body.type === "string") patch.type = body.type.trim();
    if (typeof body.targetUrl === "string") patch.targetUrl = body.targetUrl.trim();

    const pa = parsePublishedAt((body as { publishedAt?: unknown }).publishedAt);
    if (pa) patch.publishedAt = pa;

    const tags = normalizeTags(body.tags);
    if (tags !== undefined) patch.tags = tags;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
    }

    const ref = doc(db, "videos", id);
    // ← ここを updateDoc ではなく setDoc(merge) に
    await setDoc(ref, patch as Record<string, unknown>, { merge: true });

    const snap = await getDoc(ref);
    const v = snap.data() as Raw;
    return NextResponse.json({ ok: true, video: shape(snap.id, v) }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("PUT /api/videos error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

/* =========================
   POST（新規作成 or 指定IDで作成）
   ========================= */
export async function POST(req: Request) {
  try {
    if (!checkAdminKey(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const body = (await req.json().catch(() => ({}))) as Partial<Raw> & {
      id?: string;
      storagePath?: string;
      publishedAt?: unknown;
    };

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const fileUrl = typeof body.fileUrl === "string" ? body.fileUrl.trim() : "";
    const filePath = typeof body.filePath === "string" ? body.filePath.trim() : "";

    if (!title || (!fileUrl && !filePath)) {
      return NextResponse.json({ error: "title_and_(fileUrl_or_filePath)_required" }, { status: 400 });
    }

    const payload: Raw & {
      storagePath?: string;
      published: boolean;
      publishedAt: Date;
      tags: string[];
    } = {
      title,
      fileUrl,
      filePath,
      thumbUrl: typeof body.thumbUrl === "string" ? body.thumbUrl.trim() : "",
      durationSec:
        typeof body.durationSec === "number" && isFinite(body.durationSec) ? Math.floor(body.durationSec) : undefined,
      category: typeof body.category === "string" ? body.category.trim() : undefined,
      tags: normalizeTags(body.tags) ?? [],
      published: typeof body.published === "boolean" ? body.published : true,
      publishedAt: parsePublishedAt(body.publishedAt) ?? new Date(),
      storagePath: typeof body.storagePath === "string" ? body.storagePath.trim() : undefined,
      type: typeof body.type === "string" ? body.type.trim() : undefined,
      targetUrl: typeof body.targetUrl === "string" ? body.targetUrl.trim() : undefined,
    };

    let newId = body.id && String(body.id).trim();
    if (newId) {
      await setDoc(doc(db, "videos", newId), payload as Record<string, unknown>, { merge: true });
    } else {
      const added = await addDoc(collection(db, "videos"), payload as Record<string, unknown>);
      newId = added.id;
    }

    const snap = await getDoc(doc(db, "videos", newId));
    return NextResponse.json({ ok: true, video: shape(snap.id, snap.data() as Raw) }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("POST /api/videos error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
