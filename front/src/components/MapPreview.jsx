// MapPreview.jsx
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";

const MapPreview = ({ position, mapRef }) => {
  return (
    <div style={{ height: "400px", width: "100%" }} ref={mapRef}>
      <Map
        defaultCenter={position}
        defaultZoom={14}
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
        style={{ height: "100%", width: "100%" }}
        options={{
          disableDefaultUI: true
        }}
      >
        <AdvancedMarker position={position} />
      </Map>
    </div>
  );
};

export default MapPreview;
