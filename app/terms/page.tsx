// app/terms/page.tsx
export const metadata = {
    title: "利用規約 | SoraTube",
    description: "SoraTubeの利用規約",
  };
  
  export default function TermsPage() {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold">利用規約</h1>
  
        {/* About（自己紹介） */}
        <section className="mb-8 rounded-lg bg-white/5 p-4">
          <h2 className="mb-2 text-lg font-semibold">SoraTubeについて（About）</h2>
          <p className="leading-relaxed text-white/80">
            SoraTubeは<strong>AI技術</strong>を活用した
            <strong>縦型ショート動画プラットフォーム</strong>です。
            コンテンツの制作・自動配信・最適化を通じて、次世代の映像体験を提供しています。
            広告掲載・提携・コンテンツに関するご相談は
            <a href="/contact" className="underline hover:opacity-80 ml-1">お問い合わせ</a>
            よりご連絡ください。
          </p>
        </section>
  
        <p className="mb-6 text-white/80">
          この利用規約（以下「本規約」）は、SoraTube（以下「当サービス」）の提供条件および
          当サービスを利用するすべての方（以下「ユーザー」）に適用される利用条件を定めるものです。
          ユーザーは、本規約に同意した上で当サービスを利用するものとします。
        </p>
  
        <section className="space-y-6 text-sm leading-relaxed text-white/85">
          <div>
            <h2 className="mb-2 text-lg font-semibold">第1条（適用）</h2>
            <p>
              本規約は、ユーザーと当サービス運営者との間の当サービスの利用に関わる一切の関係に適用されるものとします。
            </p>
          </div>
  
          <div>
            <h2 className="mb-2 text-lg font-semibold">第2条（年齢要件）</h2>
            <p>
              当サービスは<strong>18歳以上</strong>の方のみご利用いただけます。
              年齢に関する虚偽申告が判明した場合、当サービスは利用停止等の必要な措置を講じることがあります。
            </p>
          </div>
  
          <div>
            <h2 className="mb-2 text-lg font-semibold">第3条（アカウント・利用環境）</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>ユーザーは自身の責任で通信環境・端末・ブラウザ等を準備するものとします。</li>
              <li>外部サービスの障害・仕様変更等により当サービスの全部または一部が利用できない場合があります。</li>
            </ul>
          </div>
  
          <div>
            <h2 className="mb-2 text-lg font-semibold">第4条（禁止事項）</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>18歳未満が当サービスを利用する行為、または未成年者の出演を示唆・助長する行為</li>
              <li>差別・脅迫・嫌がらせ・過度なわいせつ表現など、第三者の権利・利益を侵害する行為</li>
              <li>コンテンツの無断複製・転載・再配布・改変など、知的財産権を侵害する行為</li>
              <li>当サービス運営またはネットワーク・システムに過度の負荷を与える行為</li>
              <li>不正アクセス、データの改ざん、ボット・スクレイピング等の自動取得</li>
              <li>広告表示の改変、クリックインセンティブ等、広告主の利益を損なう行為</li>
              <li>その他、運営が不適切と判断する行為</li>
            </ul>
          </div>
  
          <div>
            <h2 className="mb-2 text-lg font-semibold">第5条（コンテンツの権利）</h2>
            <p className="mb-2">
              当サービス内のテキスト・画像・映像・プログラム等（以下「コンテンツ」）に関する著作権その他一切の知的財産権は、
              当サービスまたは正当な権利者に帰属します。ユーザーは、権利者の許諾なくコンテンツを利用してはなりません。
            </p>
            <p>
              当サービスは、運営上必要な範囲でコンテンツの表示方法・配信方法・最適化を行うことがあります。
            </p>
          </div>
  
          <div>
            <h2 className="mb-2 text-lg font-semibold">第6条（免責事項）</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>当サービスは、コンテンツの完全性・正確性・有用性等について保証しません。</li>
              <li>
                外部サービスの障害、通信環境、端末環境、ブラウザ仕様の変更、広告配信ネットワークのポリシー変更等に起因して
                生じた損害について、当サービスは一切の責任を負いません。
              </li>
              <li>
                当サービスの提供・中断・終了、機能追加・変更等によりユーザーに生じた損害について、当サービスは一切の責任を負いません。
              </li>
            </ul>
          </div>
  
          <div>
            <h2 className="mb-2 text-lg font-semibold">第7条（権利侵害に関する申告窓口）</h2>
            <p className="mb-2">
              著作権その他の権利侵害が疑われるコンテンツを発見した場合は、
              <a href="/contact" className="underline hover:opacity-80">お問い合わせ</a>
              より、以下の情報を添えてご連絡ください。
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>該当ページのURL、コンテンツの特定情報</li>
              <li>権利者または代理人の氏名・連絡先</li>
              <li>侵害の具体的な内容・理由</li>
              <li>必要に応じて権利保有を示す資料</li>
            </ul>
            <p className="mt-2">
              内容を確認の上、必要な対応（削除・差し替え・非表示等）を検討します。
            </p>
          </div>
  
          <div>
            <h2 className="mb-2 text-lg font-semibold">第8条（広告・収益化）</h2>
            <p>
              当サービスは、第三者の広告配信ネットワーク（例：ExoClick等）を利用します。
              広告表示・配信ポリシーは各ネットワークの規約に従い、ユーザーの端末情報やCookieが利用されることがあります。
              詳細は<a href="/privacy" className="underline hover:opacity-80">プライバシーポリシー</a>をご確認ください。
            </p>
          </div>
  
          <div>
            <h2 className="mb-2 text-lg font-semibold">第9条（準拠法・裁判管轄）</h2>
            <p>
              本規約は日本法を準拠法とします。本規約または当サービスに関して紛争が生じた場合、
              運営者の所在地を管轄する裁判所を第一審の専属的合意管轄とします。
            </p>
          </div>
  
          <div>
            <h2 className="mb-2 text-lg font-semibold">第10条（規約の変更）</h2>
            <p>
              当サービスは、必要に応じて本規約を変更することができます。重要な変更がある場合は、当サイト上で告知します。
            </p>
          </div>
  
          <div className="mt-8 text-xs opacity-75">
            施行日：2025年10月22日
          </div>
        </section>
      </main>
    );
  }
  