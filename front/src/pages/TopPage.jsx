import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ensureVisitor } from "../api/identity";

function TopPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [notice, setNotice] = useState("");

  const handleStart = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      await ensureVisitor();
      navigate("/home");
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
        onClick={() => setNotice("（将来）ユーザー登録は準備中です")}
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
        onClick={() => setNotice("（将来）ログインは準備中です")}
      >
        ログイン
      </button>

      {errorMsg && (
        <p role="alert" style={{ marginTop: 12, color: "#b00020" }}>
          {errorMsg}
        </p>
      )}
      {notice && (
        <p role="status" aria-live="polite" style={{ marginTop: 8, color: "#555" }}>
          {notice}
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
    </main>
  );
}

export default TopPage;
