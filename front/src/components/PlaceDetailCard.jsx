const PlaceDetailCard = ({
  place,
  thumbnailUrl,
  isSaved,
  isSaving,
  onAdd,
  onRemove,
  onAddToPlan,
  onClose,
}) => {
  if (!place) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 10px 24px rgba(0,0,0,.2)",
        zIndex: 3000,
        display: "grid",
        gridTemplateColumns: "1fr 120px",
        gap: 12,
        padding: 12,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
            title={place.name}
          >
            {place.name || "場所"}
          </div>
          <button
            aria-label="close"
            onClick={onClose}
            style={{
              background: "#f2f2f2",
              border: "none",
              width: 28,
              height: 28,
              borderRadius: 14,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginTop: 6, color: "#666", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <span>🕘</span>
          <span>—</span>
          <span style={{ marginLeft: "auto" }}>▾</span>
        </div>

        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {isSaved ? (
            <>
              <span style={{ color: "#2CA478", fontWeight: 700 }}>追加済み</span>
              <button
                onClick={onRemove}
                disabled={!onRemove}
                style={{
                  background: "none",
                  border: "none",
                  color: onRemove ? "#007aff" : "#aaa",
                  textDecoration: "underline",
                  cursor: onRemove ? "pointer" : "default",
                }}
              >
                削除
              </button>
            </>
          ) : (
            <button
              onClick={onAdd}
              disabled={isSaving}
              style={{
                background: "#2CA478",
                color: "#fff",
                border: "none",
                padding: "8px 14px",
                borderRadius: 999,
                fontWeight: 700,
                cursor: "pointer",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? "保存中..." : "追加する"}
            </button>
          )}
        </div>

        <div style={{ marginTop: 8 }}>
          <button
            onClick={onAddToPlan}
            disabled={!onAddToPlan}
            style={{
              background: "none",
              border: "none",
              color: onAddToPlan ? "#007aff" : "#aaa",
              textDecoration: "underline",
              cursor: onAddToPlan ? "pointer" : "default",
              padding: 0,
            }}
          >
            旅行プランに追加
          </button>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: 100,
          borderRadius: 12,
          background: "#e9e9e9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="サムネイル" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 13, color: "#666" }}>サムネイル</span>
        )}
      </div>
    </div>
  );
};

export default PlaceDetailCard;
