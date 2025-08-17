import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom";
import fetchYoutubeVideos from "../utils/fetchYoutubeVideos";
import VideoItem from "../components/VideoItem";

function SearchResultPage() {
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [params] = useSearchParams();
  const query = params.get("q");
  const navigate = useNavigate();

  useEffect(() => {
    if (!query) return;

    const cacheKey = `searchResult:${query}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      setVideos(parsed.videos || []);
      setChannels(parsed.channels || []);
      sessionStorage.setItem("lastQuery", query);
    } else {
      fetchYoutubeVideos(query).then((data) => {
        setVideos(data.videos || []);
        setChannels(data.channels || []);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        sessionStorage.setItem("lastQuery", query);
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
            onClick={() => navigate(`/video/${video.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default SearchResultPage;