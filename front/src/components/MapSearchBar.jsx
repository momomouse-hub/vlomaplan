function MapSearchBar({ onFocus }) {
  return (
    <div
      style={{
        height: "var(--bottom-bar-h)",
        boxSizing: "content-box",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 8,
      }}
    >
      <input
        type="text"
        onFocus={onFocus}
        placeholder="行きたい場所をお気に入りに追加"
        style={{
          height: "100%",
          width: "100%",
          boxSizing: "border-box",
          padding: "0 12px",
          paddingBlock: 8,
          fontSize: 16,
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
        readOnly
      />
    </div>
  );
}

export default MapSearchBar;
