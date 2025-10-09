import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useBlurOnRouteChange() {
  const loc = useLocation();
  useEffect(() => {
    const el = document.activeElement;
    if (el && typeof el.blur === "function") {
      el.blur();
    }
  }, [loc.pathname, loc.search, loc.hash]);
}
