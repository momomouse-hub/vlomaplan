import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";
import useIsMobile from "../hooks/useIsMobile";
import MobileLayout from "../components/layouts/MobileLayout";
import DesktopLayout from "../components/layouts/DesktopLayout";

function VideoDetailPage() {
  const { id } = useParams();
  const isMobile = useIsMobile();

  const [relatedVideos, setRelatedVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const position = { lat: 35.681236, lng: 139.767125 };

  useEffect(() => {
    const lastQuery = sessionStorage.getItem("lastQuery");
    if (!lastQuery) return;

    const cacheKey = `searchResult:${lastQuery}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const cur = (parsed.videos || []).find(v => v.id === id) || null;
      setCurrentVideo(cur);
      setRelatedVideos(parsed.videos.filter((v) => v.id !== id));
      setChannels(parsed.channels || []);
    }
  }, [id]);

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
    >
      {isMobile ? (
        <MobileLayout
          id={id}
          currentVideo={currentVideo}
          relatedVideos={relatedVideos}
          channels={channels}
          position={position}
        />
      ) : (
        <DesktopLayout
          id={id}
          relatedVideos={relatedVideos}
          channels={channels}
            position={position}
            currentVideo={currentVideo}
        />
      )}
    </APIProvider>
  );
}

export default VideoDetailPage;