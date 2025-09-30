// front/src/components/routing/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { identity } = useAuth();

  if (identity.loading) return null;

  if (!identity.registered) {
    return <Navigate to="/" replace state={{ loginRequired: true }} />;
  }

  return children;
}
