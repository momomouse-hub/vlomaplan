import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useLoginRequiredEffect(openLoginUI) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const s = location.state;
    if (s?.loginRequired) {
      openLoginUI?.();
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, openLoginUI]);
}
