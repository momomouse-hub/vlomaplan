export async function createBookmark({ video, place}) {
  const base = import.meta.env.VITE_API_BASE_URL;
  const res = await fetch(`${base}/api/bookmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      video_view: {
        youtube_video_id: video.id,
        title: video.title,
        thumbnail_url: video.thumbnail,
        search_history_id: null
      },
      place: {
        place_id: place.place_id,
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude
      }
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}