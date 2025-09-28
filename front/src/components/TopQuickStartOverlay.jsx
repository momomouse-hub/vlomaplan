import { useEffect } from "react";
import SearchBar from "./SearchBar";

export default function TopQuickStartOverlay({ onClose, onOpenLogin, onOpenRegister }) {

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const openThenClose = (fn) => {
    fn?.();
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
          boxSizing: "border-box",
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

        <div style={{ display: "grid", gap: 10 }}>
          <button
            type="button"
            onClick={() => openThenClose(onOpenRegister)}
            style={{
              width: "100%",
              boxSizing: "border-box",
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
            onClick={() => openThenClose(onOpenLogin)}
            style={{
              width: "100%",
              boxSizing: "border-box",
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
              boxSizing: "border-box",
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
