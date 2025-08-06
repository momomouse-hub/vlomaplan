import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"
import VideoPlayerWrapper from "../components/VideoPlayerWrapper";
import VideoItem from "../components/VideoItem";
import MapPreview from "./MapPreview";
import useIsMobile from "../hooks/useIsMobile";
import {Sheet} from "react-modal-sheet";

const VideoDetailPage = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [openSheet, setOpenSheet] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const position = {lat: 35.681236, lng: 139.767125};

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
    <div style={{display: "flex", flexDirection: isMobile ? "column" : "row", height: "100vh" }}>
      <div style={{flex: 1, display: "flex", flexDirection: "column"}}>
        <h2>動画再生ページ</h2>
        <div style={{flex: "0 0 300px"}}>
          <VideoPlayerWrapper videoId={id}/>
        </div>
        {isMobile && (
          <>
            <button onClick={() => {
              setOpenSheet(true);
              setShowMap(true);
            }}>
              マップを開く
            </button>
            <Sheet isOpen={openSheet} onClose={() => setOpenSheet(false)}>
              <Sheet.Container>
                <Sheet.Header />
                <Sheet.Content>
                  <div style={{display: showMap ? "block" : "none", height: "300px"}}>
                    <MapPreview position={position}/>
                  </div>
                </Sheet.Content>
              </Sheet.Container>
              <Sheet.Backdrop />
            </Sheet>
          </>
        )}
        <h3>関連動画</h3>
        <div style={{flex: 1, overflowY: "auto"}}>
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

      {!isMobile && (
        <div style={{width: "400px", marginLeft: "16px", height: "100vh"}}>
          <MapPreview position={position} />
        </div>
      )}
    </div>
  )
}

export default VideoDetailPage;