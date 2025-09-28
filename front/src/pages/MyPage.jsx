import { useEffect } from "react";
import { fetchIdentity } from "../api/identity";

export default function MyPage() {

  useEffect(() => {
    fetchIdentity().catch(() => {});
  }, []);

  const cardStyle = {
    width: "min(560px, 92vw)",
    borderRadius: 16,
    background: "rgba(255,255,255,0.94)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    padding: 20,
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "start center",
        paddingTop: 80,
        background: "linear-gradient(#3b5f56 0 0)",
      }}
    >
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>マイページ（仮）</h2>
        <p style={{ marginBottom: 16 }}>
          ここに検索バー・地図を配置予定
        </p>
      </div>
    </div>
  );
}
