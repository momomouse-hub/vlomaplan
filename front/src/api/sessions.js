import { apiFetchJson } from "./client";

const base = import.meta.env.VITE_API_BASE_URL || "";

export async function login(email, password) {
  return apiFetchJson(`${base}/api/session`, {
    method: "POST",
    body: { email, password },
  });
}

export async function logout() {
  return apiFetchJson(`${base}/api/session`, { method: "DELETE" });
}
