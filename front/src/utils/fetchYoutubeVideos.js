// fetchYoutubeVideos.js
const fetchYoutubeVideos = async (keyword) => {
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  // 1) 検索段階でできるだけ除外（ただし完全ではないので後段で二重チェック）
  const searchURL = new URL("https://www.googleapis.com/youtube/v3/search");
  searchURL.searchParams.set("part", "snippet");
  searchURL.searchParams.set("q", keyword);
  searchURL.searchParams.set("type", "video");
  searchURL.searchParams.set("maxResults", "50");
  searchURL.searchParams.set("key", API_KEY);
  searchURL.searchParams.set("safeSearch", "strict");        // ← 年齢制限/アダルト寄りを検索から除外
  searchURL.searchParams.set("videoEmbeddable", "true");     // ← 埋め込み可能な動画のみ
  searchURL.searchParams.set("videoSyndicated", "true");     // ← 外部サイト再生可のみ（保険）

  const searchRes = await fetch(searchURL.toString());
  const searchData = await searchRes.json();

  const items = Array.isArray(searchData?.items) ? searchData.items : [];
  if (items.length === 0) {
    return { videos: [], channels: [] };
  }

  const videoIds = items.map((item) => item?.id?.videoId).filter(Boolean);
  const channelIdSet = new Set(items.map((item) => item?.snippet?.channelId).filter(Boolean));

  // videoIds が空ならここで終了
  if (videoIds.length === 0) {
    return { videos: [], channels: [] };
  }

  // 2) 詳細取得（ここで age restriction を厳密チェック）
  const videosURL = new URL("https://www.googleapis.com/youtube/v3/videos");
  videosURL.searchParams.set("part", "snippet,statistics,contentDetails,status");
  videosURL.searchParams.set("id", videoIds.join(","));
  videosURL.searchParams.set("key", API_KEY);

  const videoDetailsRes = await fetch(videosURL.toString());
  const videoDetails = await videoDetailsRes.json();
  const videoItems = Array.isArray(videoDetails?.items) ? videoDetails.items : [];

  // ISO 8601 PTxxMxS → 秒
  const durationToSeconds = (duration) => {
    const match = duration?.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    const minutes = parseInt(match?.[1] || "0", 10);
    const seconds = parseInt(match?.[2] || "0", 10);
    return minutes * 60 + seconds;
  };

  // age-restricted 判定（contentDetails.contentRating.ytRating === 'ytAgeRestricted'）
  const isAgeRestricted = (v) =>
    v?.contentDetails?.contentRating?.ytRating === "ytAgeRestricted";

  // フィルタリング：
  // - 3分超
  // - 埋め込み可能
  // - 年齢制限なし
  const filteredVideos = videoItems
    .filter((v) => {
      const durationSec = durationToSeconds(v?.contentDetails?.duration || "");
      const embeddable = v?.status?.embeddable === true;
      return durationSec > 180 && embeddable && !isAgeRestricted(v);
    })
    .map((v) => ({
      id: v.id,
      title: v.snippet.title,
      thumbnail:
        v.snippet.thumbnails?.maxres?.url ??
        v.snippet.thumbnails?.standard?.url ??
        v.snippet.thumbnails?.high?.url ??
        v.snippet.thumbnails?.medium?.url ??
        `https://i.ytimg.com/vi/${v.id}/hq720.jpg`,
      channelId: v.snippet.channelId,
      duration: v.contentDetails.duration,
      viewCount: v.statistics?.viewCount ?? "0",
    }));

  // チャンネル情報（存在するときだけ問い合わせ）
  const channelIds = Array.from(channelIdSet);
  let channels = [];
  if (channelIds.length > 0) {
    const channelsURL = new URL("https://www.googleapis.com/youtube/v3/channels");
    channelsURL.searchParams.set("part", "snippet,statistics");
    channelsURL.searchParams.set("id", channelIds.join(","));
    channelsURL.searchParams.set("key", API_KEY);

    const channelDetailsRes = await fetch(channelsURL.toString());
    const channelDetails = await channelDetailsRes.json();
    const channelItems = Array.isArray(channelDetails?.items) ? channelDetails.items : [];

    channels = channelItems.map((ch) => ({
      id: ch.id,
      title: ch.snippet.title,
      icon: ch.snippet.thumbnails?.default?.url ?? "",
    }));
  }

  return {
    videos: filteredVideos,
    channels,
  };
};

export default fetchYoutubeVideos;
