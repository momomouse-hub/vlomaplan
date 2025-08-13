const TOKEN_KEY = "visitor_token";

function getVisitorToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setVisitorToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
}

export async function apiFetch(url, options={}) {
  const headers = new Headers(options.headers || {});
  const token = getVisitorToken();
  if (token) headers.set("X-Visitor-Token", token);

  const res = await fetch(url, { ...options, headers });

  const newToken = res.headers.get("X-Visitor-Token");
  if (newToken && newToken !== token) setVisitorToken(newToken);

  return res;
}