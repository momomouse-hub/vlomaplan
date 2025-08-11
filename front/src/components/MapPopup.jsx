const MapPopup = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "追加する",
  cancelLabel = "キャンセル",
  confirmDisabled = false,
}) => {
  return (
    <div
      style={{
        width: "240px",
        borderRadius: "16px",
        overflow: "hidden",
        fontFamily: "sans-serif",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          backgroundColor: "#2ca478",
          color: "white",
          fontWeight: "bold",
          padding: "12px 16px",
          fontSize: "16px",
        }}
      >
        {title}
      </div>

      <div style={{ padding: "16px" }}>
        <p style={{ fontSize: "14px", margin: "0 0 16px" }}>{message}</p>

        <button
          disabled={confirmDisabled}
          style={{
            backgroundColor: "#2ca478",
            color: "white",
            border: "none",
            borderRadius: "999px",
            padding: "8px 24px",
            fontSize: "14px",
            cursor: "pointer",
            marginBottom: "12px",
            opacity: confirmDisabled ? 0.6 : 1,
            pointerEvents: confirmDisabled ? "none": "auto",
          }}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>

        <br />

        <button
          style={{
            backgroundColor: "#f0f0f0",
            color: "#888",
            border: "none",
            borderRadius: "999px",
            padding: "6px 20px",
            fontSize: "13px",
            cursor: "pointer",
          }}
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
};

export default MapPopup;
