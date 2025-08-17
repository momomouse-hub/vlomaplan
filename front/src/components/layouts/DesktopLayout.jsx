import { useNavigate } from "react-router-dom";
import VideoPlayerWrapper from "../VideoPlayerWrapper";
import VideoItem from "../VideoItem";
import MapPreview from "../MapPreview";

function DesktopLayout({ id, relatedVideos, channels, position }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <h2>動画再生ページ</h2>
        <div style={{ flex: "0 0 300px" }}>
          <VideoPlayerWrapper videoId={id} />
        </div>

        <h3>関連動画</h3>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {relatedVideos.map((video) => (
            <VideoItem
              key={video.id}
              video={video}
              channel={channels.find((c) => c.id === video.channelId)}
              onClick={() => navigate(`/video/${video.id}`)}
            />
          ))}
        </div>
      </div>

      <div style={{ width: "400px", marginLeft: "16px", height: "100vh" }}>
        <MapPreview position={position} />
      </div>
    </div>
  );
}

export default DesktopLayout;