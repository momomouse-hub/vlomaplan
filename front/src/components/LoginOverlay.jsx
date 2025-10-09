import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/sessions";
import { useAuth } from "../contexts/AuthContext";

export default function LoginOverlay({ onClose, onSwitchToRegister }) {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

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

  const onLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setMsg("");
    setSubmitting(true);
    try {
      await login(email, password);
      await refresh();
      onClose();
      navigate("/mypage", { replace: true });
    } catch (err) {
      const code = err?.data?.error || "unknown";
      const jp = { invalid_credentials: "メールまたはパスワードが違います" };
      setMsg(jp[code] || `ログインに失敗しました (${code})`);
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle = {
    width: "min(560px, 92vw)",
    boxSizing: "border-box",
    borderRadius: 16,
    background: "rgba(255,255,255,0.94)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    padding: 20,
  };
  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 16px",
    borderRadius: 9999,
    border: "none",
    background: "#e8e8e8",
    fontSize: 16,
    outline: "2px solid transparent",
  };
  const primaryBtn = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 16px",
    borderRadius: 9999,
    border: "none",
    background: "#2CA478",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    opacity: submitting ? 0.7 : 1,
  };
  const outlineBtn = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 16px",
    borderRadius: 9999,
    background: "#fff",
    color: "#2CA478",
    border: "2px solid #2CA478",
    fontWeight: 700,
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
      <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
        {msg && (
          <p
            style={{
              margin: "0 0 12px",
              textAlign: "center",
              color: msg.includes("失敗") || msg.includes("違い") ? "#b42318" : "#2CA478",
              fontSize: 14,
            }}
          >
            {msg}
          </p>
        )}

        <form onSubmit={onLogin} style={{ display: "grid", gap: 12 }}>
          <label htmlFor="login-email" style={{ fontWeight: 600 }}>
            メールアドレス
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label htmlFor="login-password" style={{ fontWeight: 600 }}>
            パスワード
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" disabled={submitting} style={primaryBtn}>
            {submitting ? "ログイン中…" : "ログイン"}
          </button>
        </form>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e6e6e6",
            margin: "18px 0",
          }}
        />

        <div style={{ display: "grid", gap: 10 }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToRegister?.();
            }}
            style={outlineBtn}
          >
            ユーザー登録
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
