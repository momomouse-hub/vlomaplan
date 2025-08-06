import {AdvancedMarker, APIProvider, Map} from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

const MapPreview = ({position}) => {
  const [shouldRenderMap, setShouldRednerMap] = useState(false);

  useEffect(() => {
    setShouldRednerMap(true);
  }, []);
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      {shouldRenderMap && (
        <Map
          defaultCenter={position}
          defaultZoom={14}
          mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
          style={{ height: "100%", width: "100%" }}
        >
          <AdvancedMarker position={position}/>
        </Map>
      )}
    </APIProvider>
  )
}

export default MapPreview;