import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoPlayerWrapper from "../VideoPlayerWrapper";
import VideoItem from "../VideoItem";
import MapPreview from "../MapPreview";
import { Sheet } from "react-modal-sheet";
import MapSearchBar from "../MapSearchBar";
import PlaceAutocomplete from "../PlaceAutocomplete";

const MobileLayout = ({ id, relatedVideos, channels }) => {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [position, setPosition] = useState({ lat: 35.681236, lng: 139.767125 });
  const [placeName, setPlaceName] = useState("");
  const [isDraggingMap, setIsDraggingMap] = useState(false);

  const handleSelectPlace = (place) => {
    const lat = typeof place.location?.lat === "function" ? place.location.lat() : place.location?.lat;
    const lng = typeof place.location?.lng === "function" ? place.location.lng() : place.location?.lng;

    if (typeof lat !== "number" || typeof lng !== "number") {
      console.warn("Invalid lat/lng:", lat, lng);
      return;
    }

    setPlaceName(place.displayName || "選択した場所");
    setPosition({ lat, lng });
    setIsMapOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", paddingBottom: "60px" }}>
      <div style={{ flex: "0 0 200px" }}>
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

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "white",
          borderTop: "1px solid #ddd",
          padding: "10px",
        }}
      >
        <MapSearchBar onFocus={() => setIsSheetOpen(true)} />
      </div>

      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        snapPoints={[700, 400]}
        initialSnap={1}
      >
        <Sheet.Container>
          <Sheet.Header>
            <PlaceAutocomplete onPlaceSelect={handleSelectPlace} />
          </Sheet.Header>
          <Sheet.Content disableDrag={isDraggingMap}>
            {isMapOpen && (
              <div
                onTouchStart={() => setIsDraggingMap(true)}
                onTouchEnd={() => setIsDraggingMap(false)}
                onMouseEnter={() => setIsDraggingMap(true)}
                onMouseLeave={() => setIsDraggingMap(false)}
              >
                <MapPreview
                  key={`${position.lat}-${position.lng}`}
                  position={position}
                  placeName={placeName}
                />
              </div>
            )}
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={() => setIsSheetOpen(false)} />
      </Sheet>
    </div>
  );
};

export default MobileLayout;
