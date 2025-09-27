import { useNavigate } from "react-router-dom";
import VideoPlayerWrapper from "../VideoPlayerWrapper";
import VideoItem from "../VideoItem";
import MapPreview from "../MapPreview";

function DesktopLayout({ id, relatedVideos, channels, position }) {
  const navigate = useNavigate();

  return (
    <div
      className="layout-desktop"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2%",
        height: "100dvh",
      }}
    >
      <section
        style={{
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ width: "100%", aspectRatio: "16/9" }}>
          <VideoPlayerWrapper videoId={id} />
        </div>

        <h3 style={{ marginTop: "1rem" }}>関連動画</h3>
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {relatedVideos.map((video) => (
            <VideoItem
              key={video.id}
              video={video}
              channel={channels.find((c) => c.id === video.channelId)}
              onClick={() => navigate(`/video/${video.id}`)}
            />
          ))}
        </div>
      </section>

      <aside
        style={{
          minWidth: 0,
          minHeight: 0,
          height: "100%",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <MapPreview position={position} />
        </div>
      </aside>
    </div>
  );
}

export default DesktopLayout;
