import { apiFetch } from "./client";
const base = import.meta.env.VITE_API_BASE_URL || "";

export async function totalCountWishlists() {
  const res = await apiFetch(`${base}/api/wishlists/total_count`);
  if (!res.ok) throw new Error("totalCountWishlists failed");
  return res.json();
}