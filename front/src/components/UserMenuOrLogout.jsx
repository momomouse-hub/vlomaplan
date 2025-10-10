import { useNavigate } from "react-router-dom";
import { logout } from "../api/sessions";
import { useAuth } from "../contexts/AuthContext";

export default function UserMenuOrLogout() {
  const { identity, refresh } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      await refresh();
      navigate("/");
    }
  };

  if (identity?.registered) {
    return (
      <button
        type="button"
        onClick={onLogout}
        style={{
          padding: "8px 14px",
          borderRadius: 999,
          border: "1px solid #999",
          background: "white",
          cursor: "pointer",
        }}
      >
        ログアウト
      </button>
    );
  }

  return <h1>Menu</h1>;
}
