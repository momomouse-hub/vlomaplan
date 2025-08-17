import { apiFetch } from "./client";
const base = import.meta.env.VITE_API_BASE_URL || "";

export async function wishlistsStatus({ place_id }) {
  const url = new URL(`${base}/api/wishlists/status`);
  url.searchParams.set("place_id", place_id);
  const res = await apiFetch(url.toString());
  if (!res.ok) throw new Error(`wishlistStatus failed: ${res.status}`);
  return res.json();
}

export async function totalCountWishlists() {
  const res = await apiFetch(`${base}/api/wishlists/total_count`);
  if (!res.ok) throw new Error("totalCountWishlists failed");
  return res.json();
}

export async function listWishlists({ page = 1, per = 20 } = {}) {
  const url = new URL(`${base}/api/wishlists`);
  url.searchParams.set("page", page);
  url.searchParams.set("per", per);
  const res = await apiFetch(url.toString());
  if (!res.ok) throw new Error(`listWishlists failed: ${res.status}`);
  return res.json();
}

export async function deleteWishlist(id) {
  const res = await apiFetch(`${base}/api/wishlists/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error(`deleteWishlist failed: ${res.status}`);
  }
}