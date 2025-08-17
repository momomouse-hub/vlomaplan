import { apiFetch, apiFetchJson } from "./client";

const base = import.meta.env.VITE_API_BASE_URL || "";

export async function wishlistsStatus({ placeId }) {
  const url = new URL(`${base}/api/wishlists/status`);
  // クエリ名はRailsに合わせてsnake_caseで送る
  url.searchParams.set("place_id", placeId);
  return apiFetchJson(url.toString()); // ← 受信はcamelCase化される
}

export async function totalCountWishlists() {
  // { total_count: 0 } → { totalCount: 0 } に変換される
  return apiFetchJson(`${base}/api/wishlists/total_count`);
}

export async function listWishlists({ page = 1, per = 20 } = {}) {
  const url = new URL(`${base}/api/wishlists`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per", String(per));
  return apiFetchJson(url.toString());
}

// 204 No Content想定：JSON不要なので従来のapiFetchでOK
export async function deleteWishlist(id) {
  const res = await apiFetch(`${base}/api/wishlists/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(`deleteWishlist failed: ${res.status}`);
  return null;
}
