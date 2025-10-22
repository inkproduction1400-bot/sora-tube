// app/privacy/page.tsx
export const metadata = {
    title: "プライバシーポリシー | SoraTube",
    description:
      "SoraTube のプライバシーポリシー。広告・Cookie・第三者提供・18歳未満の利用禁止・連絡先について明記しています。",
  };
  
  export default function PrivacyPage() {
    return (
      <main className="min-h-[100dvh] bg-black text-white">
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <h1 className="mb-6 text-2xl font-extrabold tracking-wide">プライバシーポリシー</h1>
  
          <p className="mb-6 text-sm opacity-80">
            本ポリシーは、SoraTube（以下「当サイト」）が提供するサービスにおいて取得・利用する情報の取扱いを定めるものです。
          </p>
  
          <section className="space-y-6 text-sm leading-[1.9]">
            {/* 1) 収集する情報 */}
            <div>
              <h2 className="mb-2 text-base font-bold">1. 収集する情報</h2>
              <ul className="list-inside list-disc space-y-1 opacity-90">
                <li>
                  アクセスログ情報（IPアドレス、User-Agent、閲覧URL、リファラー、アクセス日時 など）
                </li>
                <li>
                  Cookie・識別子（広告ID等）および類似技術を通じて取得される情報
                </li>
                <li>お問い合わせフォームに入力されたメールアドレス・本文等</li>
              </ul>
            </div>
  
            {/* 2) 利用目的 */}
            <div>
              <h2 className="mb-2 text-base font-bold">2. 利用目的</h2>
              <ul className="list-inside list-disc space-y-1 opacity-90">
                <li>サービスの提供・維持・改善、品質向上のための分析</li>
                <li>広告配信および効果測定、不正防止・セキュリティの確保</li>
                <li>問い合わせ対応、必要な連絡</li>
              </ul>
            </div>
  
            {/* 3) Cookie 等の利用 */}
            <div>
              <h2 className="mb-2 text-base font-bold">3. Cookie 等の利用</h2>
              <p className="opacity-90">
                当サイトは、ユーザーの利便性向上、広告配信、アクセス解析のために
                Cookie や同等の技術を使用します。ブラウザ設定により Cookie を無効化できますが、
                その場合一部機能が正常に動作しないことがあります。
              </p>
            </div>
  
            {/* 4) 第三者提供（広告・解析） */}
            <div>
              <h2 className="mb-2 text-base font-bold">4. 第三者提供（広告・解析）</h2>
              <p className="mb-2 opacity-90">
                当サイトは、広告配信事業者（例：ExoClick）等の第三者サービスを利用する場合があり、
                これらの事業者に対して Cookie 等の識別子が送信・共有されることがあります。
                取得・利用される情報やオプトアウトの方法は、各事業者のポリシーをご確認ください。
              </p>
              <ul className="list-inside list-disc space-y-1 opacity-90">
                <li>送信され得る情報：Cookie/広告ID、閲覧ページ、リファラー等</li>
                <li>
                  目的：広告の配信・最適化・効果測定、不正防止、利用状況の分析 など
                </li>
              </ul>
            </div>
  
            {/* 5) 18 歳未満の利用 */}
            <div>
              <h2 className="mb-2 text-base font-bold">5. 18歳未満の利用について</h2>
              <p className="opacity-90">
                当サイトは成人向けの要素を含む可能性があるため、18歳未満の方は利用できません。
                18歳未満であることが判明した場合、利用をお断りし、必要に応じて情報の削除等を行います。
              </p>
            </div>
  
            {/* 6) 保管期間と削除 */}
            <div>
              <h2 className="mb-2 text-base font-bold">6. 保管期間と削除</h2>
              <p className="opacity-90">
                取得した情報は、利用目的の達成に必要な期間、または法令に基づく期間を超えて保管しません。
                ユーザーからの削除要請があった場合は、法令に基づき適切に対応します。
              </p>
            </div>
  
            {/* 7) 開示・訂正・削除等の請求／問い合わせ先 */}
            <div>
              <h2 className="mb-2 text-base font-bold">
                7. 開示・訂正・削除等の請求／お問い合わせ先
              </h2>
              <p className="opacity-90">
                取得情報の開示・訂正・削除、権利侵害の申し立て等は、以下の窓口までご連絡ください。
                申請の際は該当 URL、具体的な理由、連絡先を明記してください。
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
  
            {/* 8) 本ポリシーの変更 */}
            <div>
              <h2 className="mb-2 text-base font-bold">8. 本ポリシーの変更</h2>
              <p className="opacity-90">
                本ポリシーの内容は適宜見直し・改定することがあります。重要な変更がある場合は、
                当サイト上で告知します。
              </p>
            </div>
  
            {/* 9) 準拠法 */}
            <div>
              <h2 className="mb-2 text-base font-bold">9. 準拠法</h2>
              <p className="opacity-90">
                本ポリシーは日本法に準拠し、当サイトの運営者所在地を管轄する裁判所を専属的合意管轄とします。
              </p>
            </div>
  
            <p className="mt-6 text-xs opacity-60">最終更新日：{new Date().toLocaleDateString("ja-JP")}</p>
          </section>
        </div>
      </main>
    );
  }
  