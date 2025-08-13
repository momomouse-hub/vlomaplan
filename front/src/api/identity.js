import { apiFetch, __setVisitorToken } from "./client";
const base = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchIdentity() {
  const res = await apiFetch(`${base}/api/identity`);
  if (!res.ok) throw new Error("identity failed");
  return res.json();
}

export async function ensureVisitor() {
  const existing = localStorage.getItem("visitor_token");
  if (existing) return { token: existing };
  const data = await fetchIdentity();
  if (data?.token) __setVisitorToken(data.token);
  return data;
}