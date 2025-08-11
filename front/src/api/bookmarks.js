const base = import.meta.env.VITE_API_BASE_URL || '';

export async function createBookmark(payload) {
  const res = await fetch(`${base}/api/bookmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`create failed: ${res.status}`);
  return res.json();
}

export async function existsBookmark({ youtube_video_id, place_id }) {
  const url = new URL(`${base}/api/bookmarks/exists`);
  url.searchParams.set('youtube_video_id', youtube_video_id);
  url.searchParams.set('place_id', place_id);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`exists failed: ${res.status}`);
  return res.json();
}

export async function countBookmarks({ youtube_video_id }) {
  const url = new URL(`${base}/api/bookmarks/count`);
  url.searchParams.set('youtube_video_id', youtube_video_id);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`count failed: ${res.status}`);
  return res.json();
}