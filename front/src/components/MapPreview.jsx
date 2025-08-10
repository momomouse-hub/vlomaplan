import { Map } from "@vis.gl/react-google-maps";
import { useState } from "react";
import MapPopup from "./MapPopup";
import CustomMarker from "./CustomMarker";

const MapPreview = ({ position, placeName }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
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
            src={isFavorite ? "/filledheart.svg" : "/heart.svg"}
            alt="お気に入り"
            style={{ width: "32px", height: "32px" }}
          />
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
          onClick={() => setIsPopupOpen(!isPopupOpen)}
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
              confirmLabel="追加する"
              cancelLabel="キャンセル"
              onConfirm={() => {
                setIsFavorite(true);
                setIsPopupOpen(false);
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
