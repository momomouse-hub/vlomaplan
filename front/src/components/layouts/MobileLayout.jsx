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

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [position, setPosition] = useState({ lat: 35.681236, lng: 139.767125 });
  const [placeName, setPlaceName] = useState("");
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 配列で渡すためのスナップポイント
  const [snapPoints, setSnapPoints] = useState([560, 360]);

  const isDesktop = typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

  // “いま実際に見えている高さ”から安全なスナップ値を算出
  const computeSnapPoints = () => {
    const clientH = document.documentElement?.clientHeight || 0; // 最優先（PCで安定）
    const vvH = window.visualViewport?.height || 0;
    const winH = window.innerHeight || 0;
    const vh = clientH || vvH || winH || 800;

    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h")
      ) || 0;

    // デスクトップでは余裕を少し大きめに取る
    const SLOP = isDesktop ? 48 : 24;

    const maxUsable = Math.max(0, vh - headerH - SLOP);

    const full = Math.max(420, Math.floor(maxUsable));     // はみ出さない最大
    const mid  = Math.min(400, Math.round(full * 0.6));     // 中段（使いやすい高さ）
    return [full, mid];
  };

  // 初期計算
  useLayoutEffect(() => {
    setSnapPoints(computeSnapPoints());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // リサイズにだけ追従（scrollは監視しない）
  useEffect(() => {
    const onResize = () => setSnapPoints(computeSnapPoints());
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 開閉に合わせて body スクロールをロック（安定化）
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

  // 開いた瞬間に再計算＆再スナップ（遅延ロード由来のズレ吸収）
  useEffect(() => {
    if (!isSheetOpen) return;
    setSnapPoints(computeSnapPoints());
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sheetRef.current?.snapTo(0); // 0 = 最大スナップ
      });
    });
  }, [isSheetOpen]); // eslint-disable-line react-hooks/exhaustive-deps

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
    requestAnimationFrame(() => {
      sheetRef.current?.snapTo(0); // 0 = 最大スナップ
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        // シート閉時だけ、下固定の検索バーぶん余白を確保
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

      {/* 画面下固定の検索バー（シート表示時は透明化 & クリック無効化） */}
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
        <MapSearchBar onFocus={() => setIsSheetOpen(true)} />
      </div>

      {/* シート */}
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
            // 念のための上限（シート内の内部再計測で伸びすぎるのを防ぐ）
            maxHeight: "calc(100dvh - var(--header-h) - 8px)",
          }}
        >
          <Sheet.Header>
            <PlaceAutocomplete onPlaceSelect={handleSelectPlace} />
          </Sheet.Header>

          {/* 可視領域フィット：1fr + 安全域 */}
          <Sheet.Content
            disableDrag={isDraggingMap}
            style={{
              display: "grid",
              gridTemplateRows: "1fr auto",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <div
              style={{ minHeight: 0 }}
              onTouchStart={() => setIsDraggingMap(true)}
              onTouchEnd={() => setIsDraggingMap(false)}
              onMouseEnter={() => setIsDraggingMap(true)}
              onMouseLeave={() => setIsDraggingMap(false)}
            >
              {isMapOpen && (
                <MapPreview
                  key={`${position.lat}-${position.lng}`}
                  position={position}
                  placeName={placeName}
                  selectedPlace={selectedPlace}
                  currentVideo={currentVideo}
                  onRequestExpand={expandSheetToMax}
                />
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
