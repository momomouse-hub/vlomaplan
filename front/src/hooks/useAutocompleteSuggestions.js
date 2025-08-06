import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

export function useAutocompleteSuggestions(inputValue) {
  const placesLib = useMapsLibrary("places");
  const sessionTokenRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!placesLib) return;

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    if (!inputValue) {
      setSuggestions([]);
      return;
    }

    const request = {
      input: inputValue,
      sessionToken: sessionTokenRef.current,
    };

    AutocompleteSuggestion.fetchAutocompleteSuggestions(request).then((res) => {
      setSuggestions(res.suggestions);
    });
  }, [inputValue, placesLib]);

  return {
    suggestions,
    resetSession: () => {
      sessionTokenRef.current = null;
      setSuggestions([]);
    },
  };
}
