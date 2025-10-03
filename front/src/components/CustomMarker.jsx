import { useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

function CustomMarker({ position, isFavorite, isSelected = false, onClick }) {
  const map = useMap();
  const markerLib = useMapsLibrary("marker");
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !markerLib) {
      return () => { };
    }

    const { PinElement, AdvancedMarkerElement } = markerLib;

    let contentElement;

    if (isFavorite) {
      const img = document.createElement("img");
      img.src = isSelected ? "/selectedfilledheart.svg" : "/filledheart.svg";
      img.alt = "お気に入り";
      img.style.width = "48px";
      img.style.height = "48px";
      contentElement = img;
    } else {
      const pin = new PinElement({
        scale: 1.5,
        glyph: "+",
        glyphColor: "#fff",
        background: "#2ca478",
        borderColor: "#2ca478",
      });
      contentElement = pin.element;
    }

    const marker = new AdvancedMarkerElement({
      position,
      map,
      content: contentElement,
      zIndex: isSelected ? 999 : 0,
    });

    if (onClick) {
      marker.addListener("click", onClick);
    }

    markerRef.current = marker;

    return () => {
      marker.map = null;
    };
  }, [map, markerLib, position, isFavorite, isSelected, onClick]);

  return null;
}

export default CustomMarker;
