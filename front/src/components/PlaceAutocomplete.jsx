import { useState, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useAutocompleteSuggestions } from "../hooks/useAutocompleteSuggestions";

const PlaceAutocomplete = ({ onPlaceSelect }) => {
  useMapsLibrary("places");

  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);

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
      fields: ["displayName", "formattedAddress", "location", "viewport"],
    });

    console.log("[選択されたPlaceの内容]", place);

    resetSession();
    setInputValue("");
    setSearchValue("");
    onPlaceSelect(place);
  }, [onPlaceSelect, resetSession]);

  return (
    <div style={{ padding: "10px", backgroundColor: "#fff" }}>
      <input
        type="text"
        placeholder="行きたい場所をお気に入りに追加"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
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
      <ul style={{ listStyle: "none", margin: 0, padding: "0" }}>
        {suggestions.map((s, idx) => (
          <li
            key={idx}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderBottom: "1px solid #eee",
            }}
            onClick={() => handleSelect(s)}
          >
            {s.placePrediction?.text?.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaceAutocomplete;
