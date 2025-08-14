import { apiFetch } from "./client";
const base = import.meta.env.VITE_API_BASE_URL || '';

export async function createBookmark(payload) {
  const res = await apiFetch(`${base}/api/bookmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`create failed: ${res.status}`);
  return res.json();
}

export async function totalCountBookmarks() {
  const res = await apiFetch(`${base}/api/bookmarks/total_count`);
  if (!res.ok) throw new Error("totalCountBookmarks failed");
  return res.json();
}

export async function placeStatus({ place_id }) {
  const url = new URL(`${base}/api/bookmarks/place_status`);
  url.searchParams.set('place_id', place_id);
  const res = await apiFetch(url.toString());
  if (!res.ok) throw new Error(`placeStatus failed: ${res.status}`);
  return res.json();
}