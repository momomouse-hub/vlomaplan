export default function PlaceDetailCard({
  place,
  thumbnailUrl,
  isSaved,
  isSaving,
  onAdd,
  onRemove,
  onAddToPlan,
  onClose,
  variant = "overlay",
  onRootClick,
  thumbWidth = "28%",
  thumbHeight,
  // 追加：オーバーレイ時の“下からの持ち上げ量”
  overlayOffset = "clamp(24px, 5vh, 56px)",
}) {
  if (!place) return null;

  const thumbW = typeof thumbWidth === "number" ? `${thumbWidth}px` : thumbWidth;
  const thumbH = typeof thumbHeight === "number" ? `${thumbHeight}px` : thumbHeight;

  const isOverlay = variant === "overlay";

  const containerStyle = isOverlay
    ? {
        position: "absolute",
        left: "2.5%",
        right: "2.5%",
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${overlayOffset})`,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 10px 24px rgba(0,0,0,.2)",
        zIndex: 3000,
        display: "grid",
        gridTemplateColumns: `1fr ${thumbW}`,
        gap: 12,
        padding: 12,
      }
    : {
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #eee",
        display: "grid",
        gridTemplateColumns: `1fr ${thumbW}`,
        gap: 12,
        padding: 10,
        cursor: onRootClick ? "pointer" : "default",
      };

  const title = place.name || "場所";
  const address = place.address || "—";

  const renderContent = () => (
    <>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
            title={title}
          >
            {title}
          </div>

          {isOverlay && (
            <button
              type="button"
              aria-label="close"
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
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
          )}
        </div>

        <div
          title={address}
          style={{
            marginTop: 6,
            color: "#666",
            fontSize: 12,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {address}
        </div>

        <div
          style={{
            marginTop: 6,
            color: "#666",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>🕘</span>
          <span>—</span>
          <span style={{ marginLeft: "auto" }}>▾</span>
        </div>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {isSaved ? (
            <>
              <span style={{ color: "#2CA478", fontWeight: 700 }}>追加済み</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.();
                }}
                disabled={!onRemove}
                style={{
                  background: "none",
                  border: "none",
                  color: onRemove ? "#007aff" : "#aaa",
                  textDecoration: "underline",
                  cursor: onRemove ? "pointer" : "default",
                  padding: 0,
                }}
              >
                削除
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdd?.();
              }}
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlan?.();
            }}
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
          height: thumbH,
          borderRadius: 12,
          background: "#e9e9e9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="サムネイル"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 13, color: "#666" }}>サムネイル</span>
        )}
      </div>
    </>
  );

  if (onRootClick) {
    return (
      <div
        style={containerStyle}
        role="button"
        tabIndex={0}
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onRootClick(e);
          }
        }}
        onClick={(e) => {
          onRootClick(e);
        }}
      >
        {renderContent()}
      </div>
    );
  }

  return <div style={containerStyle}>{renderContent()}</div>;
}
