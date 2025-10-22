// app/terms/page.tsx
export const metadata = {
    title: "利用規約 | SoraTube",
    description:
      "SoraTube の利用規約。18歳以上の利用条件、禁止事項、免責、権利侵害の申立窓口、準拠法・管轄について定めます。",
  };
  
  export default function TermsPage() {
    return (
      <main className="min-h-[100dvh] bg-black text-white">
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <h1 className="mb-6 text-2xl font-extrabold tracking-wide">利用規約</h1>
  
          <p className="mb-6 text-sm opacity-80">
            本規約（以下「本規約」）は、SoraTube（以下「当サイト」）の提供するサービスの利用条件を定めるものです。
            利用者は、本規約に同意の上で当サイトを利用するものとします。
          </p>
  
          <section className="space-y-6 text-sm leading-[1.9]">
            {/* 1) 18歳以上 */}
            <div>
              <h2 className="mb-2 text-base font-bold">1. 利用資格（18歳以上）</h2>
              <p className="opacity-90">
                当サイトは成人向けの要素を含む可能性があります。ご利用は
                <strong>18歳以上</strong>
                の方に限られます。18歳未満の方の利用はできません。
              </p>
            </div>
  
            {/* 2) 禁止事項 */}
            <div>
              <h2 className="mb-2 text-base font-bold">2. 禁止事項</h2>
              <p className="opacity-90">利用者は、以下の行為を行ってはなりません。</p>
              <ul className="mt-2 list-inside list-disc space-y-1 opacity-90">
                <li>法令、公序良俗、または第三者の権利・利益を侵害する行為</li>
                <li>未成年者（18歳未満）に関するコンテンツの投稿・共有・示唆</li>
                <li>暴力・差別・ハラスメント・嫌がらせ・脅迫等の不適切行為</li>
                <li>誹謗中傷、名誉・信用を毀損する行為、プライバシー侵害</li>
                <li>著作権・商標権・肖像権等の知的財産権を侵害する行為</li>
                <li>不正アクセス、システムへの攻撃、スクレイピング等の技術的妨害</li>
                <li>当サイトの運営を妨げる行為、虚偽申告、なりすまし</li>
                <li>本規約または別途定めるガイドライン等に違反する行為</li>
              </ul>
            </div>
  
            {/* 3) 免責 */}
            <div>
              <h2 className="mb-2 text-base font-bold">3. 免責事項</h2>
              <ul className="list-inside list-disc space-y-1 opacity-90">
                <li>
                  当サイトは、提供する情報・コンテンツの正確性、完全性、有用性等について保証しません。
                </li>
                <li>
                  利用者が当サイトを利用したことにより生じた損害について、当サイトは一切の責任を負いません。
                  ただし、当サイトの故意または重過失による場合を除きます。
                </li>
                <li>
                  メンテナンス、障害、法令・ガイドラインの変更、または運営上の都合により、事前の告知なく
                  サービスの全部または一部を中断・終了することがあります。
                </li>
              </ul>
            </div>
  
            {/* 4) 権利侵害の申立窓口 */}
            <div>
              <h2 className="mb-2 text-base font-bold">4. 権利侵害の申立窓口</h2>
              <p className="opacity-90">
                著作権、肖像権、名誉権、プライバシー等の侵害が疑われる場合は、下記窓口に
                「該当URL・侵害の内容・権利者情報・連絡先」を明記の上ご連絡ください。
                確認の上、必要な対応（掲載停止等）を検討します。
              </p>
              <p className="mt-2 font-mono">
                連絡先：{" "}
                <a
                  className="underline decoration-white/50 underline-offset-4 hover:opacity-90"
                  href="mailto:ink.production1400@gmail.com"
                >
                  ink.production1400@gmail.com
                </a>
              </p>
            </div>
  
            {/* 5) 準拠法・管轄 */}
            <div>
              <h2 className="mb-2 text-base font-bold">5. 準拠法・合意管轄</h2>
              <p className="opacity-90">
                本規約は日本法に準拠します。本規約または当サイトの利用に関して生じた紛争については、
                当サイト運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </div>
  
            {/* 6) 規約の変更 */}
            <div>
              <h2 className="mb-2 text-base font-bold">6. 規約の変更</h2>
              <p className="opacity-90">
                当サイトは、必要に応じて本規約を変更することがあります。重要な変更を行う場合は、
                当サイト上で告知します。変更後に当サイトを利用した場合、変更に同意したものとみなします。
              </p>
            </div>
  
            <p className="mt-6 text-xs opacity-60">最終更新日：{new Date().toLocaleDateString("ja-JP")}</p>
          </section>
        </div>
      </main>
    );
  }
  