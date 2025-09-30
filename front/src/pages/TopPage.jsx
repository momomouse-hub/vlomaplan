import { useCallback, useState } from "react";
import { ensureVisitor } from "../api/identity";
import TopQuickStartOverlay from "../components/TopQuickStartOverlay";
import LoginOverlay from "../components/LoginOverlay";
import RegisterOverlay from "../components/RegisterOverlay";
import { useLoginRequiredEffect } from "../hooks/useLoginRequiredEffect";

function TopPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [opening, setOpening] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const openLoginUI = useCallback(() => {
    setLoginOpen(true);
  }, []);

  useLoginRequiredEffect(openLoginUI);

  const handleStart = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      await ensureVisitor();
      setOpening(true);
    } catch (e) {
      console.error(e);
      setErrorMsg("初期化に失敗しました。ネットワークを確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: 16 }}>
      <h1 style={{ textAlign: "center" }}>VloMaPlan</h1>
      <p style={{ textAlign: "center" }}>
        動画から旅のヒントを得よう<br />〜Vlog視聴・Map検索・プラン作成 すべてこれ一つで〜
      </p>

      <button
        type="button"
        onClick={handleStart}
        disabled={loading}
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
        {loading ? "はじめています…" : "さっそく使ってみる"}
      </button>

      <button
        type="button"
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 9999,
          marginTop: 12,
          background: "transparent",
          color: "#2CA478",
          border: "2px solid #2CA478",
          fontWeight: 700,
        }}
        onClick={() => setRegisterOpen(true)}
      >
        ユーザー登録
      </button>

      <button
        type="button"
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 9999,
          marginTop: 12,
          background: "#2CA478",
          color: "#fff",
          fontWeight: 700,
        }}
        onClick={() => setLoginOpen(true)}
      >
        ログイン
      </button>

      {errorMsg && (
        <p role="alert" style={{ marginTop: 12, color: "#b00020" }}>
          {errorMsg}
        </p>
      )}

      <div
        style={{
          marginTop: 24,
          height: 200,
          background: "#e5e5e5",
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
        }}
      >
        使い方
      </div>

      {opening && (
        <TopQuickStartOverlay
          onClose={() => setOpening(false)}
          onOpenLogin={() => setLoginOpen(true)}
          onOpenRegister={() => setRegisterOpen(true)}
        />
      )}
      {loginOpen && (
        <LoginOverlay
          onClose={() => setLoginOpen(false)}
          onSwitchToRegister={() => {
            setLoginOpen(false);
            setRegisterOpen(true);
          }}
        />
      )}
      {registerOpen && (
        <RegisterOverlay
          onClose={() => setRegisterOpen(false)}
          onSwitchToLogin={() => {
            setRegisterOpen(false);
            setLoginOpen(true);
          }}
        />
      )}
    </main>
  );
}

export default TopPage;
