import { apiFetchJson } from "./client";

const base = import.meta.env.VITE_API_BASE_URL || "";

export async function createBookmark(payload) {
  // payloadはcamelCaseで渡す（送信時にsnake_caseへ自動変換）
  return apiFetchJson(`${base}/api/bookmarks`, {
    method: "POST",
    body: payload,
  });
}

export async function totalCountBookmarks() {
  return apiFetchJson(`${base}/api/bookmarks/totalCount`); // totalCountに変換
}

export async function placeStatus({ placeId }) {
  const url = new URL(`${base}/api/bookmarks/place_status`);
  url.searchParams.set("place_id", placeId); // クエリはsnakeで送る
  return apiFetchJson(url.toString());       // 受信はcamelに
}
