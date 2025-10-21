// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "SoraTube",
  description: "AI縦型ショート動画",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
