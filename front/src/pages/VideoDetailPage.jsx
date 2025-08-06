import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"
import ReactPlayer from "react-player";
import VideoItem from "../components/VideoItem";

const VideoDetailPage = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const lastQuery = sessionStorage.getItem("lastQuery");
    if(!lastQuery) return;

    const cacheKey = `searchResult:${lastQuery}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if(cachedData){
      const parsed = JSON.parse(cachedData);
      setRelatedVideos(parsed.videos.filter((v) => v.id !== id));
      setChannels(parsed.channels || []);
    }
  }, [id]);

  return(
    <div>
      <h2>動画再生ページ</h2>
      <ReactPlayer
        src={`https://www.youtube.com/watch?v=${id}`}
        controls
        style={{width: "100%", aspectRatio: "16/9"}}
      />
      <h3>関連動画</h3>
      <div>
        {relatedVideos.map((video) => (
          <VideoItem
            key={video.id}
            video={video}
            channel={channels.find(c => c.id === video.channelId)}
            onClick={() => navigate(`/video/${video.id}`)}
          />
        ))}
      </div>
    </div>
  )
}

export default VideoDetailPage;