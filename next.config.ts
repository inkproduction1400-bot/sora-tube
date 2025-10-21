// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // Next.jsの最適化を使わずそのまま配信したい場合は true（開発や外部CDN利用時に便利）
    unoptimized: true,
    // placehold.co が SVG を返すことがあるため許可（不要なら外してOK）
    dangerouslyAllowSVG: true,
    remotePatterns: [
      // Supabase public bucket（あなたのプロジェクトドメインに合わせて追加）
      { protocol: "https", hostname: "*.supabase.co" },
      // プレースホルダー（使う場合）
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },

  async headers() {
    return [
      // public/img 以下のサムネイル（同梱画像）は強キャッシュ
      {
        source: "/img/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // API は既定でキャッシュしない（必要に応じて各APIで上書き）
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },

  // 型/ESLintでビルドを止めたくない場合はコメントアウトを外す
  // typescript: { ignoreBuildErrors: true },
  // eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
