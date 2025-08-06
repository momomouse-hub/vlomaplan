import {AdvancedMarker, APIProvider, Map} from '@vis.gl/react-google-maps';

const MapTestPage = () => {
  const position = { lat: 35.681236, lng: 139.767125 };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={position}
          defaultZoom={14}
          mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
          style={{ height: "100%", width: "100%" }}
        >
          <AdvancedMarker position={position}/>
        </Map>
      </APIProvider>
    </div>
  )
}

export default MapTestPage;