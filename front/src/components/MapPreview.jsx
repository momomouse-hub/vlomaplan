import { useEffect, useRef, useState } from "react";
import { useMap, Map } from "@vis.gl/react-google-maps";
import CustomMarker from "./CustomMarker";
import MapPopup from "./MapPopup";
import PlaceDetailCard from "./PlaceDetailCard";
import { createBookmark } from "../api/bookmarks";
import { totalCountWishlists, wishlistsStatus } from "../api/wishlists";

const MapPreview = ({
  position,
  placeName,
  selectedPlace,
  currentVideo,
  onRequestExpand,
  mapHeight,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [isSavedGlobally, setIsSavedGlobally] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalFavCount, setTotalFavCount] = useState(0);

  const [isSaved, setIsSaved] = useState(false);

  const hasAnyFavorites = totalFavCount > 0;

  const map = useMap();
  const prevH = useRef(mapHeight);

  const [placeThumbUrl, setPlaceThumbUrl] = useState(null);

  useEffect(() => {
    if (!map) return;
    const oldH = prevH.current;
    const newH = mapHeight;
    if (typeof oldH === "number" && typeof newH === "number" && oldH !== newH) {
      const dy = (newH - oldH) / 2;
      map.panBy(0, dy);
    }
    prevH.current = newH;
  }, [mapHeight, map]);

  useEffect(() => {
    (async () => {
      try {
        const { total_count } = await totalCountWishlists();
        setTotalFavCount(Number(total_count || 0));
      } catch (e) {
        console.warn("total_count init failed:", e);
      }
    })();
  }, []);

  useEffect(() => {
    const pid = selectedPlace?.place_id;
    if (!pid) return;
    (async () => {
      try {
        const { saved, thumbnail_url } = await wishlistsStatus({ place_id: pid });
        setIsSavedGlobally(!!saved);
        setPlaceThumbUrl(thumbnail_url || null);
      } catch (e) {
        console.warn("place_status init failed:", e);
        setIsSavedGlobally(false);
        setPlaceThumbUrl(null);
      }
    })();
  }, [selectedPlace?.place_id]);

  useEffect(() => {
    setIsPopupOpen(false);
    setShowDetail(false);
  }, [selectedPlace?.place_id, position.lat, position.lng]);

  const handleAddFavorite = async () => {
    if (!selectedPlace || !currentVideo || isSaving || isSavedGlobally) return;
    try {
      setIsSaving(true);
      await createBookmark({
        video_view: {
          youtube_video_id: currentVideo.id,
          title: currentVideo.title,
          thumbnail_url: currentVideo.thumbnail,
          search_history_id: null,
        },
        place: {
          place_id: selectedPlace.place_id,
          name: selectedPlace.name,
          address: selectedPlace.address,
          latitude: selectedPlace.latitude,
          longitude: selectedPlace.longitude,
        },
      });
      setIsSavedGlobally(true);
      try {
        const { total_count } = await totalCountWishlists();
        setTotalFavCount(Number(total_count || 0));
      } catch {}
      setIsPopupOpen(false);
      setShowDetail(true);
      onRequestExpand?.();
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました。通信状況をご確認ください。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ height: (mapHeight ?? 400) + "px", width: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          zIndex: 1100,
        }}
      >
        <button
          onClick={() => alert("いきたい場所リストを開く")}
          style={{
            position: "relative",
            backgroundColor: "white",
            border: "2px solid #2CA478",
            borderRadius: "50%",
            padding: 12,
            cursor: "pointer",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={hasAnyFavorites ? "/filledheart.svg" : "/heart.svg"}
            alt="いきたい場所リスト"
            style={{ width: 32, height: 32 }}
          />
          {hasAnyFavorites && (
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                background: "#e02424",
                color: "#fff",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}
            >
              {totalFavCount}
            </span>
          )}
        </button>

        <button
          onClick={() => alert("旅行プラン機能は準備中です")}
          style={{
            backgroundColor: "white",
            border: "2px solid #2CA478",
            borderRadius: "50%",
            padding: 12,
            cursor: "pointer",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={isSaved ? "/filledluggage.svg" : "/luggage.svg"} alt="旅行プラン" style={{ width: 32, height: 32 }} />
        </button>
      </div>

      <Map
        defaultCenter={position}
        defaultZoom={14}
        options={{ disableDefaultUI: true }}
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
        style={{ height: "100%", width: "100%" }}
        onClick={() => {
          setIsPopupOpen(false);
          setShowDetail(false);
        }}
      >
        <CustomMarker
          position={position}
          isFavorite={isSavedGlobally}
          onClick={() => {
            if (isSavedGlobally) {
              setShowDetail(true);
              setIsPopupOpen(false);
              onRequestExpand?.();
            } else {
              setIsPopupOpen(true);
              setShowDetail(false);
            }
          }}
        />

        {isPopupOpen && !isSavedGlobally && (
          <div
            style={{
              position: "absolute",
              top: "calc(50% - 150px)",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
            }}
          >
            <MapPopup
              title={placeName}
              message={"行きたい場所リストに追加しますか？"}
              confirmLabel={isSaving ? "保存中..." : "追加する"}
              cancelLabel="キャンセル"
              confirmDisabled={isSaving || !currentVideo?.id || !selectedPlace?.place_id}
              onConfirm={handleAddFavorite}
              onCancel={() => setIsPopupOpen(false)}
            />
          </div>
        )}
      </Map>

      {showDetail && isSavedGlobally && (
        <PlaceDetailCard
          place={selectedPlace}
          thumbnailUrl={placeThumbUrl ?? currentVideo?.thumbnail ?? null}
          isSaved
          isSaving={isSaving}
          onAdd={undefined}
          onRemove={undefined}
          onAddToPlan={() => alert("旅行プラン機能は準備中です")}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};

export default MapPreview;