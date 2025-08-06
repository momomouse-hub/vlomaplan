const fetchYoutubeVideos = async (keyword) => {
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=50&key=${API_KEY}`
  );

  const data = await response.json();
  return data;
}

export default fetchYoutubeVideos;