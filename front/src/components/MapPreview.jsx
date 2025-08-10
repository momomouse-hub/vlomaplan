import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useRef, useState } from "react";
import MapPopup from "./MapPopup";

const MapPreview = ({ position, placeName }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const markerRef = useRef(null);

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <Map
        defaultCenter={position}
        defaultZoom={14}
        options={{ disableDefaultUI: true }}
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
        style={{ height: "100%", width: "100%" }}
        onClick={() => setIsPopupOpen(false)}
      >
        <AdvancedMarker
          position={position}
          ref={markerRef}
          onClick={() => setIsPopupOpen(!isPopupOpen)}
        >
          <Pin
            background={"#397e3bff"}
            glyphColor={"#FFFFFF"}
            borderColor={"#397e3bff"}
            glyph={"+"}
          />
        </AdvancedMarker>

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
                alert("追加しました！");
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
