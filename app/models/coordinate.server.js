/**
 * 外部APIコールの実験
 *
 * @returns
 */
export async function getCoordinateList() {
  console.log("-> getCoordinateList")
  const url = "https://api.stg.ogne.jp/v1/coordinate";
  const query = new URLSearchParams({
    per_page: 4,
    page: 1,
  });

  // TODO: Get From ENV
  const tenantCode = "demo";
  const sessionId = "4ob2yhiwnpuiv2asuddyg5kvoczbr9v0";

  const response = await fetch(`${url}?${query}`, {
    method: "GET",
    headers: {
      "Cookie": `sessionid=${sessionId};`,
      "X-Coord-Server-Site-Code": tenantCode,
    },
  });
  console.log("-> response.data=", response.data)
  return response.data;
}
