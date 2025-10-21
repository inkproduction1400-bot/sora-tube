// components/AdminVideoEditor.tsx
"use client";

import { useMemo, useState } from "react";

type V = {
  id: string;
  title: string;
  category?: string;
  thumbUrl?: string;
  durationSec?: number;
  fileUrl: string;
  tags?: string[];
  published?: boolean;
};

export default function AdminVideoEditor({ initial }: { initial: V }) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [tagsInput, setTagsInput] = useState((initial.tags ?? []).join(", "));
  const [published, setPublished] = useState(!!initial.published);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const chips = useMemo(() => {
    return Array.from(
      new Set(
        (tagsInput || "")
          .split(/[,\s]+/)
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      )
    );
  }, [tagsInput]);

  const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || ""; // 開発中のみ

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/videos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(ADMIN_API_KEY ? { "x-admin-key": ADMIN_API_KEY } : {}),
        },
        body: JSON.stringify({
          id: initial.id,
          title,
          tags: chips,
          published,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "update_failed");
      setMessage("保存しました");
    } catch (e: any) {
      setMessage(`エラー: ${e.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm opacity-80">タイトル</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/10 p-2 outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm opacity-80">
          タグ（カンマ or スペース区切り・英小文字スラッグ）
        </label>
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="例) suits fps"
          className="w-full rounded-lg border border-white/10 bg-white/10 p-2 outline-none"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.length ? (
            chips.map((c) => (
              <span key={c} className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
                {c}
              </span>
            ))
          ) : (
            <span className="text-xs opacity-60">（タグなし）</span>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span>公開する</span>
      </label>

      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
      >
        {saving ? "保存中…" : "保存"}
      </button>

      {message && <div className="text-sm opacity-80">{message}</div>}

      <div className="mt-6 rounded-lg bg-white/5 p-3 text-sm">
        <div>ID: {initial.id}</div>
        <div className="truncate">fileUrl: {initial.fileUrl}</div>
      </div>
    </div>
  );
}
