import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet } from "react-modal-sheet";
import VideoPlayerWrapper from "../VideoPlayerWrapper";
import VideoItem from "../VideoItem";
import MapPreview from "../MapPreview";
import MapSearchBar from "../MapSearchBar";
import PlaceAutocomplete from "../PlaceAutocomplete";

function MobileLayout({ id, relatedVideos, channels, currentVideo }) {
  const navigate = useNavigate();
  const sheetRef = useRef(null);
  const autocompleteInputRef = useRef(null);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [position, setPosition] = useState({ lat: 35.681236, lng: 139.767125 });
  const [placeName, setPlaceName] = useState("");
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [wishlistTotal, setWishlistTotal] = useState(null);
  const masked = (wishlistTotal === 0 || wishlistTotal === null) && !selectedPlace;
  const [snapPoints, setSnapPoints] = useState([560, 360]);

  const isDesktop =
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

  const computeSnapPoints = () => {
    const clientH = document.documentElement?.clientHeight || 0;
    const vvH = window.visualViewport?.height || 0;
    const winH = window.innerHeight || 0;
    const vh = clientH || vvH || winH || 800;

    const SLOP = isDesktop ? 48 : 24;
    const maxUsable = Math.max(0, vh - SLOP);
    const full = Math.max(420, Math.floor(maxUsable));
    const mid = Math.min(400, Math.round(full * 0.6));
    return [full, mid];
  };

  useLayoutEffect(() => {
    setSnapPoints(computeSnapPoints());
  }, []); // eslint-disable-line

  useEffect(() => {
    const onResize = () => setSnapPoints(computeSnapPoints());
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev || "";
    }
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isSheetOpen]);

  useEffect(() => {
    if (!isSheetOpen) return;
    setSnapPoints(computeSnapPoints());
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sheetRef.current?.snapTo(0);
      });
    });
  }, [isSheetOpen]); // eslint-disable-line

  useEffect(() => {
    setIsMapOpen(isSheetOpen);
  }, [isSheetOpen]);

  const handleSelectPlace = (p) => {
    const lat = Number(p.latitude);
    const lng = Number(p.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setSelectedPlace(p);
    setPlaceName(p.name || "選択した場所");
    setPosition({ lat, lng });
    setIsMapOpen(true);
  };

  const expandSheetToMax = () => {
    setIsSheetOpen(true);
    requestAnimationFrame(() => sheetRef.current?.snapTo(0));
  };

  const openSheetAndFocus = () => {
    setIsSheetOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sheetRef.current?.snapTo(0);
        setTimeout(() => {
          const el = autocompleteInputRef.current;
          if (el?.focus) {
            el.focus();
            try {
              const len = el.value?.length ?? 0;
              el.setSelectionRange?.(len, len);
            } catch (e) {
              // ✦ 修正: 空の catch を回避（no-empty 対応）
              // 一部ブラウザで selectionRange が失敗するケースを無視
            }
          }
        }, 60);
      });
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        paddingBottom: isSheetOpen
          ? 0
          : "calc(var(--bottom-bar-h) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div style={{ flex: "0 0 30%" }}>
        <VideoPlayerWrapper videoId={id} />
      </div>

      <h4>関連動画</h4>
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
        }}
      >
        <MapSearchBar onPress={openSheetAndFocus} />
      </div>

      <Sheet
        ref={sheetRef}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        snapPoints={snapPoints}
        initialSnap={1}
        style={{ zIndex: 2000 }}
      >
        <Sheet.Container
          style={{
            zIndex: 2000,
            overflow: "hidden",
            maxHeight: "calc(100dvh - 8px)",
          }}
        >
          <Sheet.Header>
            <PlaceAutocomplete
              onPlaceSelect={handleSelectPlace}
              inputRef={autocompleteInputRef}
            />
          </Sheet.Header>

          <Sheet.Content
            disableDrag={isDraggingMap}
            style={{
              display: "grid",
              gridTemplateRows: "1fr auto",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <div style={{ position: "relative", minHeight: 0 }}>
              {isMapOpen && (
                <>
                  <div
                    style={{ position: "absolute", inset: 0 }}
                    onTouchStart={() => !masked && setIsDraggingMap(true)}
                    onTouchEnd={() => setIsDraggingMap(false)}
                    onMouseEnter={() => !masked && setIsDraggingMap(true)}
                    onMouseLeave={() => setIsDraggingMap(false)}
                  >
                    <MapPreview
                      position={position}
                      placeName={placeName}
                      selectedPlace={selectedPlace}
                      currentVideo={currentVideo}
                      onRequestExpand={expandSheetToMax}
                      onSelectPlace={handleSelectPlace}
                      onWishlistTotalChange={setWishlistTotal}
                    />
                  </div>

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
                </>
              )}
            </div>

            <div style={{ height: "max(env(safe-area-inset-bottom, 0px), 16px)" }} />
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={() => setIsSheetOpen(false)} />
      </Sheet>
    </div>
  );
}

export default MobileLayout;
