"use client";

export default function FC2Banner300() {
  // スクショから復元（必要なら管理画面の正タグで置き換え）
  const html = `
<!-- バナー（SOD select見放題）ここから -->
<a href="https://cnt.affiliate.fc2.com/cgi-bin/click.cgi?aff_userid=3553738&aff_siteid=3478198&aff_shopid=409" target="_blank">
  <img src="https://cnt.affiliate.fc2.com/cgi-bin/banner.cgi?aff_siteid=3478198&bid=20988&uid=3553733" width="300" height="250" border="0" />
</a>
<!-- ここまで -->
`.trim();

  return (
    <div
      className="w-full"
      style={{ aspectRatio: "6 / 5" }} // 300x250 ≒ 6:5
      aria-label="fc2-banner-300x250"
    >
      <div
        className="grid h-full w-full place-items-center overflow-hidden rounded-2xl bg-black/80"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
