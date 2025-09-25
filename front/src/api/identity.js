import { apiFetchJson } from "./client";
const base = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchIdentity() {
  return apiFetchJson(`${base}/api/identity`, { method: "GET" });
}

export async function ensureVisitor() {
  return apiFetchJson(`${base}/api/identity?ensure=1`, { method: "GET" });
}
