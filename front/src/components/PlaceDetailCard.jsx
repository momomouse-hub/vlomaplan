export default function PlaceDetailCard({
  place,
  thumbnailUrl,
  isSaved,
  isSaving,
  onAdd,
  onRemove,
  onAddToPlan,
  planMembership,
  onRemoveFromPlan,
  onClose,
  variant = "overlay",
  onRootClick,
  thumbWidth = "28%",
  thumbHeight,
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

  const linkBtnStyle = (enabled = true) => ({
    background: "none",
    border: "none",
    color: enabled ? "#007aff" : "#aaa",
    textDecoration: "underline",
    cursor: enabled ? "pointer" : "default",
    padding: 0,
    font: "inherit",
  });

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
                style={linkBtnStyle(!!onRemove)}
              >
                削除
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isSaving) onAdd?.();
              }}
              disabled={isSaving || !onAdd}
              style={linkBtnStyle(!(isSaving || !onAdd))}
            >
              {isSaving ? "保存中..." : "行きたい場所リストに追加"}
            </button>
          )}
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
          {planMembership ? (
            <>
              <span style={{ color: "#2CA478", fontWeight: 700 }}>
                「{planMembership.planName}」
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromPlan?.();
                }}
                disabled={!onRemoveFromPlan}
                style={linkBtnStyle(!!onRemoveFromPlan)}
              >
                削除
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlan?.();
              }}
              disabled={!onAddToPlan}
              style={linkBtnStyle(!!onAddToPlan)}
            >
              旅行プランに追加
            </button>
          )}
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
