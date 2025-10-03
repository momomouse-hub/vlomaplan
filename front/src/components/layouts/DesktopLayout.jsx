import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import VideoPlayerWrapper from "../VideoPlayerWrapper";
import VideoItem from "../VideoItem";
import MapPreview from "../MapPreview";
import PlaceAutocomplete from "../PlaceAutocomplete";

function DesktopLayout({ id, relatedVideos, channels, currentVideo }) {
  const navigate = useNavigate();

  const [position, setPosition] = useState({ lat: 35.681236, lng: 139.767125 });
  const [placeName, setPlaceName] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [wishlistTotal, setWishlistTotal] = useState(null);
  const masked = (wishlistTotal === 0 || wishlistTotal === null) && !selectedPlace;

  const handleSelectPlace = useCallback((p) => {
    const lat = Number(p.latitude);
    const lng = Number(p.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setSelectedPlace(p);
    setPlaceName(p.name || "選択した場所");
    setPosition({ lat, lng });
  }, []);

  return (
    <div
      className="layout-desktop"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2%",
        height: "calc(100dvh - var(--header-h, 0px))",
        minHeight: 0,
      }}
    >
      <section style={{ minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
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

      <aside style={{ minWidth: 0, minHeight: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateRows: "auto 1fr",
            height: "100%",
            minHeight: 0,
          }}
        >
          <div>
            <PlaceAutocomplete
              onPlaceSelect={handleSelectPlace}
            />
          </div>

          <div style={{ position: "relative", minHeight: 0 }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <MapPreview
                position={position}
                placeName={placeName}
                selectedPlace={selectedPlace}
                currentVideo={currentVideo}
                onSelectPlace={handleSelectPlace}
                onWishlistTotalChange={setWishlistTotal}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(1px)",
                  transition: "opacity .25s ease",
                  opacity: masked ? 1 : 0,
                  pointerEvents: masked ? "auto" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#444",
                  fontSize: 14,
                  fontWeight: "bold",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    background: "rgba(255,255,255)",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  ↑検索バーで行きたい場所を検索してください
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default DesktopLayout;
