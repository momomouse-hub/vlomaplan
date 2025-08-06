import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom";
import fetchYoutubeVideos from "../utils/fetchYoutubeVideos";
import VideoItem from "../components/VideoItem";

const SearchResultPage = () => {
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [params] = useSearchParams();
  const query = params.get("q");

  useEffect(() => {
    if (!query) return;

    const cacheKey = `searchResult:${query}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      setVideos(parsed.videos || []);
      setChannels(parsed.channels || []);
      console.log("【キャッシュから取得】videos:", parsed.videos);
    } else {
      fetchYoutubeVideos(query).then((data) => {
        setVideos(data.videos || []);
        setChannels(data.channels || []);
        console.log("【APIから取得】videos:", data.videos);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      });
    }
  }, [query]);

  return (
    <div>
      <h2>検索結果：{query}</h2>
      <div>
        {videos.map((video) => (
          <VideoItem
            key={video.id}
            video={video}
            channel={channels.find(c => c.id === video.channelId)}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResultPage;