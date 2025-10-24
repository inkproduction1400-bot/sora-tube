// app/contact/page.tsx
export const metadata = {
  title: "Contact | SoraTube",
  description: "お問い合わせ窓口",
};

export default function ContactPage() {
  const email = "ink.production1400@gmail.com";
  const subject = encodeURIComponent("【SoraTube】お問い合わせ");
  const body = encodeURIComponent(
    [
      "※このまま送信いただけます。必要に応じて書き換えてください。",
      "",
      "■お名前：",
      "■ご連絡先：",
      "■お問い合わせ内容：",
    ].join("\n"),
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-white">
      <h1 className="mb-3 text-2xl font-extrabold">Contact</h1>
      <p className="mb-6 opacity-80">
        お問い合わせは以下のメールアドレスまでご連絡ください。
      </p>
      <p>
        広告掲載・提携・掲載リクエスト等についても、以下メール宛にご連絡ください。
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-2 text-sm opacity-70">メールアドレス</div>
        <div className="mb-4 break-all text-lg font-semibold">{email}</div>

        <a
          href={`mailto:${email}?subject=${subject}&body=${body}`}
          className="inline-flex items-center rounded-xl bg-white/15 px-4 py-2 text-sm hover:bg-white/25"
        >
          メールを作成する
        </a>
      </div>

      <p className="mt-6 text-sm opacity-70">
        返信にはお時間をいただく場合があります。迷惑メールフォルダもご確認ください。
      </p>
    </main>
  );
}
