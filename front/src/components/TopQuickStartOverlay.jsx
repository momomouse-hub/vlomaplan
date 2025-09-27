// front/src/components/TopQuickStartOverlay.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function TopQuickStartOverlay({ onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // 背景スクロール防止
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const go = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 1000,
        display: "grid",
        placeItems: "start center",
        paddingTop: 80,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 92vw)",
          borderRadius: 16,
          background: "rgba(255,255,255,0.94)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          padding: 20,
        }}
      >

        <div style={{ marginBottom: 14 }}>
          <SearchBar placeholder="Vlogを探す" autoFocus />
        </div>

        <div
          style={{
            fontSize: 12,
            background: "#f3f6f5",
            borderRadius: 10,
            padding: "10px 12px",
            textAlign: "center",
            opacity: 0.9,
            marginBottom: 14,
          }}
        >
          ※作成したプランは一時的に保存されます（最大7日間）
          <br />
          ログインすれば、プランをいつでも保存・編集できます
        </div>

        {/* ← ここから順序を「登録 → ログイン」に入れ替え */}
        <div style={{ display: "grid", gap: 10 }}>
          <button
            type="button"
            onClick={() => go("/register")}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 9999,
              background: "#fff",
              color: "#2CA478",
              border: "2px solid #2CA478",
              fontWeight: 700,
            }}
          >
            ユーザー登録
          </button>

          <button
            type="button"
            onClick={() => go("/login")}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 9999,
              border: "none",
              background: "#2CA478",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            ログイン
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "none",
              background: "transparent",
              color: "#47625a",
            }}
          >
            × とじる（Esc）
          </button>
        </div>
      </div>
    </div>
  );
}
