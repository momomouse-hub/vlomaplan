import { useEffect, useState } from "react";
import { Map } from "@vis.gl/react-google-maps";
import MapPopup from "./MapPopup";
import CustomMarker from "./CustomMarker";
import { createBookmark, existsBookmark, totalCountBookmarks } from "../api/bookmarks";

const MapPreview = ({ position, placeName, selectedPlace, currentVideo }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalFavCount, setTotalFavCount] = useState(0);
  const hasAnyFavorites = totalFavCount > 0;

  useEffect(() => {
    const youtubeId = currentVideo?.id;
    const placeId = selectedPlace?.place_id;
    if (!youtubeId || !placeId) return;

    (async () => {
      try {
        const exRes = await existsBookmark({ youtube_video_id: youtubeId, place_id: placeId });
        setIsFavorite(Boolean(exRes?.exists));
      } catch (e) {
        console.warn("exists init failed:", e);
      }
    })();
  }, [currentVideo?.id, selectedPlace?.place_id]);

  useEffect(() => {
    (async () => {
      try {
        const { total_count } = await totalCountBookmarks();
        setTotalFavCount(Number(total_count || 0));
      } catch (e) {
        console.warn("total_count init failed:", e);
      }
    })();
  }, []);

  return (
    <div style={{ height: "400px", width: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          zIndex: 1100,
        }}
      >
        <button
          onClick={() => alert("お気に入りリストを開く")}
          style={{
            position: "relative",
            backgroundColor: "white",
            border: "2px solid #2CA478",
            borderRadius: "50%",
            padding: "12px",
            cursor: "pointer",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={hasAnyFavorites ? "/filledheart.svg" : "/heart.svg"}
            alt="お気に入り"
            style={{ width: "32px", height: "32px" }}
          />
          {hasAnyFavorites && (
            <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
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
          onClick={() => alert("保存リストを開く")}
          style={{
            backgroundColor: "white",
            border: "2px solid #2CA478",
            borderRadius: "50%",
            padding: "12px",
            cursor: "pointer",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={isSaved ? "/filledluggage.svg" : "/luggage.svg"}
            alt="保存リスト"
            style={{ width: "32px", height: "32px" }}
          />
        </button>
      </div>

      <Map
        defaultCenter={position}
        defaultZoom={14}
        options={{ disableDefaultUI: true }}
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
        style={{ height: "100%", width: "100%" }}
        onClick={() => setIsPopupOpen(false)}
      >
        <CustomMarker
          position={position}
          isFavorite={isFavorite}
          onClick={() => setIsPopupOpen((v) => !v)}
        />

        {isPopupOpen && (
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
              confirmLabel={isSaving ? "保存中..." : isFavorite ? "保存済み" : "追加する"}
              cancelLabel="キャンセル"
              confirmDisabled={
                isSaving || isFavorite || !currentVideo?.id || !selectedPlace?.place_id
              }
              onConfirm={async () => {
                if (!selectedPlace || !currentVideo || isSaving || isFavorite) return;
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
                  setIsFavorite(true);
                  setTotalFavCount((c) => c + 1);
                  setIsPopupOpen(false);
                } catch (e) {
                  console.error(e);
                  alert("保存に失敗しました。通信状況をご確認ください。");
                } finally {
                  setIsSaving(false);
                }
              }}
              onCancel={() => setIsPopupOpen(false)}
            />
          </div>
        )}
      </Map>
    </div>
  );
};

export default MapPreview;