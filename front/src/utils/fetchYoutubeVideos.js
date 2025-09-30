const fetchYoutubeVideos = async (keyword) => {
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=50&key=${API_KEY}`
  );

  const searchData = await searchRes.json();

  const videoIds = searchData.items.map((item) => item.id.videoId).join(",");
  const channelIds = [...new Set(searchData.items.map((item) => item.snippet.channelId))].join(",");

  const videoDetailsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,status&id=${videoIds}&key=${API_KEY}`
  );
  const videoDetails = await videoDetailsRes.json();

  const durationToSeconds = (duration) => {
    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    const minutes = parseInt(match?.[1] || "0", 10);
    const seconds = parseInt(match?.[2] || "0", 10);
    return minutes * 60 + seconds;
  }

  const filteredVideos = videoDetails.items
    .filter((video) => {
      const durationSec = durationToSeconds(video.contentDetails?.duration || "");
      const embeddable = video.status?.embeddable;
      return durationSec > 180 && embeddable;
    })
    .map((video) => ({
      id: video.id,
      title: video.snippet.title,
      thumbnail:
        ( video.snippet.thumbnails.maxres?.url ??
          video.snippet.thumbnails.standard?.url ??
          video.snippet.thumbnails.high?.url ??
          video.snippet.thumbnails.medium?.url ??
          `https://i.ytimg.com/vi/${video.id}/hq720.jpg`),
      channelId: video.snippet.channelId,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
    }))

  const channelDetailsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}&key=${API_KEY}`
  );
  const channelDetails = await channelDetailsRes.json();

  const channels = channelDetails.items.map((channel) => ({
    id: channel.id,
    title: channel.snippet.title,
    icon: channel.snippet.thumbnails.default.url,
  }))

  return {
    videos: filteredVideos,
    channels,
  }
}

export default fetchYoutubeVideos;