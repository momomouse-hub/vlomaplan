import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/registrations";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterOverlay({ onClose, onSwitchToLogin }) {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (password !== password2) {
      setMsg("パスワード（確認）が一致しません");
      return;
    }
    if (password.length < 8) {
      setMsg("パスワードは8文字以上にしてください");
      return;
    }

    setMsg("");
    setSubmitting(true);
    try {
      await register(email, password, password2);
      await refresh();
      onClose();
      navigate("/mypage", { replace: true });
    } catch (err) {
      const code = err?.data?.error || "unknown";
      const jp = {
        already_registered: "すでに登録済みです",
        password_confirmation_mismatch: "パスワード（確認）が一致しません",
        weak_password: "パスワードは8文字以上にしてください",
        email_unavailable: "このメールアドレスは使用できません",
        invalid_parameters: "入力内容を確認してください",
      };
      setMsg(jp[code] || `登録に失敗しました (${code})`);
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ユーザー登録"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "start center",
        paddingTop: 80,
      }}
    >
      <button
        type="button"
        aria-label="閉じる（背景）"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "default",
          zIndex: 0,
        }}
      />

      <div
        style={{
          ...cardStyle,
          position: "relative",
          zIndex: 1,
        }}
      >
        {msg && (
          <p
            style={{
              margin: "0 0 12px",
              textAlign: "center",
              color:
                msg.includes("失敗") ||
                msg.includes("一致しません") ||
                msg.includes("できません")
                  ? "#b42318"
                  : "#2CA478",
              fontSize: 14,
            }}
          >
            {msg}
          </p>
        )}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label htmlFor="reg-email" style={{ fontWeight: 600 }}>
            メールアドレス
          </label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label htmlFor="reg-password" style={{ display: "grid", gap: 4 }}>
            <span style={{ fontWeight: 600, lineHeight: 1.2 }}>パスワード</span>
            <span
              id="pw-hint"
              style={{ fontWeight: 400, fontSize: 12, color: "#47625a", opacity: 0.9, lineHeight: 1.2 }}
            >
              8文字以上にしてください
            </span>
          </label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
            aria-describedby="pw-hint"
          />

          <label htmlFor="reg-password2" style={{ fontWeight: 600 }}>
            パスワード（確認）
          </label>
          <input
            id="reg-password2"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" disabled={submitting} style={primaryBtn}>
            {submitting ? "登録中…" : "登録"}
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
              onSwitchToLogin?.();
            }}
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
            ログインへ
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
