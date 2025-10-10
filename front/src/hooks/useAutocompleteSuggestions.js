import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

export function useAutocompleteSuggestions(searchValue) {
  const placesLib = useMapsLibrary("places");
  const sessionTokenRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!placesLib || !searchValue) return;

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    if (!searchValue) {
      setSuggestions([]);
      return;
    }

    const request = {
      input: searchValue,
      sessionToken: sessionTokenRef.current,
    };

    AutocompleteSuggestion.fetchAutocompleteSuggestions(request).then((res) => {
      setSuggestions(res.suggestions);
    });
  }, [searchValue, placesLib]);

  return {
    suggestions,
    resetSession: () => {
      sessionTokenRef.current = null;
      setSuggestions([]);
    },
  };
}
