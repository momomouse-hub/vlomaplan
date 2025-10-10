function MapSearchBar({ onPress, onFocus }) {
  const trigger = onPress || onFocus;

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
        placeholder="行きたい場所をお気に入りに追加"
        readOnly
        onMouseDown={(e) => { e.preventDefault(); trigger?.(); }}
        onTouchStart={(e) => { e.preventDefault(); trigger?.(); }}
        onClick={(e) => { e.preventDefault(); trigger?.(); }}
        onFocus={(e) => { e.target.blur(); trigger?.(); }}
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
      />
    </div>
  );
}

export default MapSearchBar;
