import { apiFetchJson, __setVisitorToken } from "./client";

const base = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchIdentity() {
  // { user_id, token } → { userId, token } に変換されて返る
  return apiFetchJson(`${base}/api/identity`);
}

export async function ensureVisitor() {
  const existing = localStorage.getItem("visitor_token");
  if (existing) return { token: existing };
  const data = await fetchIdentity();
  if (data?.token) __setVisitorToken(data.token);
  return data;
}
