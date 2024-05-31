/**
 * OGNEコーディネート一覧の取得
 *
 * @returns Array<Object>
 */
export async function getCoordinateList() {
  console.log("-> getCoordinateList")
  // OGNEコーディネート一覧取得API
  const url = "https://api.stg.ogne.jp/v1/coordinate";
  // サンプルのクエリパラメータ
  const query = new URLSearchParams({
    per_page: 4,
    page: 1,
  });

  // TODO: これらの値（認証情報）は環境変数 or Shopifyの設定から取得する想定
  const tenantCode = "demo";
  const sessionId = "4ob2yhiwnpuiv2asuddyg5kvoczbr9v0";

  // リクエスト送信
  const response = await fetch(`${url}?${query}`, {
    method: "GET",
    headers: {
      "Cookie": `sessionid=${sessionId};`,
      "X-Coord-Server-Site-Code": tenantCode,
    },
  });
  // リクエストボディ（JSON）を、オブジェクトに変換して返します。
  const coordinateList = await response.json()
  console.log("-> coordinateList", coordinateList)
  return coordinateList;
}
