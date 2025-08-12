import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoPlayerWrapper from "../VideoPlayerWrapper";
import VideoItem from "../VideoItem";
import MapPreview from "../MapPreview";
import { Sheet } from "react-modal-sheet";
import MapSearchBar from "../MapSearchBar";
import PlaceAutocomplete from "../PlaceAutocomplete";

const MobileLayout = ({ id, relatedVideos, channels, currentVideo }) => {
  const navigate = useNavigate();

  const sheetRef = useRef(null);
  const contentRef = useRef(null);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [position, setPosition] = useState({ lat: 35.681236, lng: 139.767125 });
  const [placeName, setPlaceName] = useState("");
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [maxSnap, setMaxSnap] = useState(650);

  const computeMaxSnap = () => {
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const SLOP = 32;
    return Math.max(420, Math.min(650, vh - SLOP));
  };

  useLayoutEffect(() => {
    setMaxSnap(computeMaxSnap());
  }, []);

  useEffect(() => {
    const onResize = () => setMaxSnap(computeMaxSnap());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [contentHeight, setContentHeight] = useState(400);
  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const ro = new ResizeObserver(() => setContentHeight(el.clientHeight));
    setContentHeight(el.clientHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isSheetOpen]);

  const handleSelectPlace = (p) => {
    const lat = Number(p.latitude);
    const lng = Number(p.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.warn("Invalid lat/lng:", lat, lng);
      return;
    }
    setSelectedPlace(p);
    setPlaceName(p.name || "選択した場所");
    setPosition({ lat, lng });
    setIsMapOpen(true);
  };

  const expandSheetToMax = () => {
    setIsSheetOpen(true);
    requestAnimationFrame(() => {
      sheetRef.current?.snapTo(0);
      requestAnimationFrame(() => {
        if (contentRef.current) setContentHeight(contentRef.current.clientHeight);
      });
    });
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
          zIndex: isSheetOpen ? 0 : 1000,
          pointerEvents: isSheetOpen ? "none" : "auto",
          opacity: isSheetOpen ? 0 : 1,
          transition: "opacity .18s ease",
          backgroundColor: "white",
          borderTop: "1px solid #ddd",
          padding: "10px",
        }}
      >
        <MapSearchBar onFocus={() => setIsSheetOpen(true)} />
      </div>

      <Sheet
        ref={sheetRef}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        snapPoints={[maxSnap, 400]}
        initialSnap={1}
        style={{ zIndex: 2000 }}
      >
        <Sheet.Container style={{ zIndex: 2000, overflow: "visible" }}>
          <Sheet.Header>
            <PlaceAutocomplete onPlaceSelect={handleSelectPlace} />
          </Sheet.Header>

          <Sheet.Content
            ref={contentRef}
            disableDrag={isDraggingMap}
            style={{
              overflow: "visible",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
            }}
          >
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
                  selectedPlace={selectedPlace}
                  currentVideo={currentVideo}
                  onRequestExpand={expandSheetToMax}
                  mapHeight={contentHeight}
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
