import { camelizeKeys, decamelizeKeys } from "../utils/case";

export const TOKEN_KEY = "visitor_token";

export function getVisitorToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setVisitorToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
}
export const __setVisitorToken = setVisitorToken;

export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getVisitorToken();
  if (token) headers.set("X-Visitor-Token", token);

  const res = await fetch(url, { ...options, headers });

  const newToken = res.headers.get("X-Visitor-Token");
  if (newToken) setVisitorToken(newToken);

  return res;
}

export async function apiFetchJson(url, options = {}) {
  const { body, headers: hdrs, ...rest } = options;
  const headers = new Headers(hdrs || {});
  const token = getVisitorToken();
  if (token) headers.set("X-Visitor-Token", token);

  let outBody = body;

  if (outBody && !(outBody instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    outBody = JSON.stringify(decamelizeKeys(outBody));
  }

  const res = await fetch(url, { ...rest, headers, body: outBody });

  const newToken = res.headers.get("X-Visitor-Token");
  if (newToken) setVisitorToken(newToken);

  const text = await res.text();
  const raw = text ? JSON.parse(text) : null;
  const data = raw != null ? camelizeKeys(raw) : null;

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
