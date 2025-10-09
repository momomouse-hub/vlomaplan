import { useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

function CustomMarker({
  position,
  isFavorite,
  isSelected = false,
  inPlan = false,
  sortOrder = null,
  forceNumberPin = false,
  onClick,
}) {
  const map = useMap();
  const markerLib = useMapsLibrary("marker");
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !markerLib || !position) return;

    const { AdvancedMarkerElement } = markerLib;

    const marker = new AdvancedMarkerElement({
      position,
      map,
      zIndex: isSelected ? 999 : 0,
    });

    if (onClick && marker.addListener) {
      marker.addListener("click", onClick);
    }

    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [map, markerLib]);

  useEffect(() => {
    if (!markerRef.current || !markerLib) return;
    const { PinElement } = markerLib;

    const SIZE = 42;
    const HALO_PAD = 8;
    const BADGE_SIZE = 20;

    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.width = `${SIZE}px`;
    container.style.height = `${SIZE}px`;
    container.style.transform = isSelected ? "scale(1.06)" : "none";

    const halo = document.createElement("div");
    halo.style.position = "absolute";
    halo.style.left = "50%";
    halo.style.top = "50%";
    halo.style.transform = "translate(-50%, -50%)";
    halo.style.width = `${SIZE + HALO_PAD}px`;
    halo.style.height = `${SIZE + HALO_PAD}px`;
    halo.style.background = "#fff";
    halo.style.borderRadius = "50%";
    halo.style.boxShadow = "0 2px 6px rgba(0,0,0,.25)";
    halo.style.zIndex = "0";
    container.appendChild(halo);

    let baseEl;

    if (forceNumberPin && Number.isFinite(Number(sortOrder))) {
      const pin = new PinElement({
        scale: 1.6,
        glyph: String(sortOrder),
        glyphColor: "#fff",
        background: "#2ca478",
        borderColor: "#2ca478",
      });
      const wrap = document.createElement("div");
      wrap.style.width = `${SIZE}px`;
      wrap.style.height = `${SIZE}px`;
      wrap.style.display = "grid";
      wrap.style.placeItems = "center";
      wrap.style.position = "relative";
      wrap.style.zIndex = "1";
      wrap.appendChild(pin.element);
      baseEl = wrap;
    } else if (isFavorite) {
      const img = document.createElement("img");
      img.src = isSelected ? "/selectedfilledheart.svg" : "/filledheart.svg";
      img.alt = "お気に入り";
      img.style.width = `${SIZE}px`;
      img.style.height = `${SIZE}px`;
      img.style.display = "block";
      img.style.position = "relative";
      img.style.zIndex = "1";
      baseEl = img;
    } else if (inPlan) {
      const wrap = document.createElement("div");
      wrap.style.width = `${SIZE}px`;
      wrap.style.height = `${SIZE}px`;
      wrap.style.display = "grid";
      wrap.style.placeItems = "center";
      wrap.style.position = "relative";
      wrap.style.zIndex = "1";

      const bag = document.createElement("img");
      bag.src = isSelected ? "/selectedfilledluggage.svg" : "/filledluggage.svg";
      bag.alt = "旅行プランに含まれる";
      bag.style.width = `${SIZE}px`;
      bag.style.height = `${SIZE}px`;
      wrap.appendChild(bag);

      baseEl = wrap;
    } else {
      const pin = new PinElement({
        scale: 1.4,
        glyph: "+",
        glyphColor: "#fff",
        background: "#2ca478",
        borderColor: "#2ca478",
      });
      const wrap = document.createElement("div");
      wrap.style.width = `${SIZE}px`;
      wrap.style.height = `${SIZE}px`;
      wrap.style.display = "grid";
      wrap.style.placeItems = "center";
      wrap.style.position = "relative";
      wrap.style.zIndex = "1";
      wrap.appendChild(pin.element);
      baseEl = wrap;
    }

    container.appendChild(baseEl);

    if (!(forceNumberPin && Number.isFinite(Number(sortOrder)))) {
      if (inPlan && isFavorite) {
        const badge = document.createElement("div");
        badge.style.position = "absolute";
        badge.style.right = "-2px";
        badge.style.bottom = "-2px";
        badge.style.width = `${BADGE_SIZE}px`;
        badge.style.height = `${BADGE_SIZE}px`;
        badge.style.borderRadius = `${BADGE_SIZE / 2}px`;
        badge.style.background = "#fff";
        badge.style.boxShadow = "0 1px 3px rgba(0,0,0,.25)";
        badge.style.display = "grid";
        badge.style.placeItems = "center";
        badge.style.zIndex = "2";

        const bag = document.createElement("img");
        bag.src = "/badge-bag.svg";
        bag.alt = "プランに含まれる";
        bag.style.width = "14px";
        bag.style.height = "14px";
        badge.appendChild(bag);

        container.appendChild(badge);
      }
    }

    markerRef.current.content = container;
    markerRef.current.zIndex = isSelected ? 999 : 0;

    if (position) {
      markerRef.current.position = position;
    }

    const root = markerRef.current.element;
    if (root) {
      while (root.firstChild) root.removeChild(root.firstChild);
      root.appendChild(container);
    }
  }, [markerLib, isFavorite, isSelected, inPlan, sortOrder, forceNumberPin, position]);

  useEffect(() => {
    if (!markerRef.current) return;
  }, [onClick]);

  return null;
}

export default CustomMarker;
