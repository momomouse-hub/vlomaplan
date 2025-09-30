import { useState, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useAutocompleteSuggestions } from "../hooks/useAutocompleteSuggestions";

function PlaceAutocomplete({ onPlaceSelect, onSearchStart }) {
  useMapsLibrary("places");

  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [firedStart, setFiredStart] = useState(false);

  const { suggestions, resetSession } = useAutocompleteSuggestions(searchValue);

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
    setSearchValue(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      setSearchValue(inputValue);
    }
  };

  const handleSelect = useCallback(async (suggestion) => {
    if (!suggestion.placePrediction) return;

    const place = suggestion.placePrediction.toPlace();
    await place.fetchFields({
      fields: ["id", "displayName", "formattedAddress", "location", "viewport"],
    });

    resetSession();
    setInputValue("");
    setSearchValue("");
    const lat = typeof place.location?.lat === "function" ? place.location.lat() : place.location?.lat;
    const lng = typeof place.location?.lng === "function" ? place.location.lng() : place.location?.lng;
    onPlaceSelect({
      placeId: place.id,
      name: place.displayName,
      address: place.formattedAddress,
      latitude: lat,
      longitude: lng,
    });
  }, [onPlaceSelect, resetSession]);

  return (
    <div style={{ padding: "10px", backgroundColor: "#fff" }}>
      <input
        type="text"
        placeholder="行きたい場所をお気に入りに追加"
        value={inputValue}
        onChange={(e) => {
          const v = e.target.value;
          setInputValue(v);
          if (!firedStart && v.trim().length > 0) {
            setFiredStart(true);
            onSearchStart?.();
          }
        }}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "10px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      />
      <ul role="listbox" style={{ listStyle: "none", margin: 0, padding: "0" }}>
        {suggestions.map((s) => {
          const key =
            s.placePrediction?.id ??
            s.placePrediction?.placeId ??
            s.placePrediction?.text?.text;
          return (
            <li key={key} role="presentation" style={{ borderBottom: "1px solid #eee" }}>
              <button
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => handleSelect(s)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label={s.placePrediction?.text?.text}
              >
                {s.placePrediction?.text?.text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PlaceAutocomplete;