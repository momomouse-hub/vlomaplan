import { useEffect, useCallback, useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { fetchIdentity } from "../api/identity";
import MapPreview from "../components/MapPreview";
import SearchBar from "../components/SearchBar";

export default function MyPage() {
  useEffect(() => {
    fetchIdentity().catch(() => {});
  }, []);

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
      style={{
        minHeight: "calc(100dvh - var(--header-h, 0px))",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 0,
        padding: 0,
        minWidth: 0,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", padding: "12px 16px" }}>
        <SearchBar placeholder="Vlogを探す" />
      </div>

      <APIProvider
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={["places"]}
        language="ja"
        region="JP"
      >
        <div style={{ position: "relative", minHeight: 0, height: "100%" }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <MapPreview
              position={position}
              placeName={placeName}
              selectedPlace={selectedPlace}
              onSelectPlace={handleSelectPlace}
              onWishlistTotalChange={setWishlistTotal}
            />

            {/* 初期マスク */}
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
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                ↑ 上の検索バーでVlogを検索するか、右上から「行きたい場所リスト／旅行プラン」を開いてください
              </div>
            </div>
          </div>
        </div>
      </APIProvider>
    </div>
  );
}
