function MapSearchBar({ onFocus }) {
  return (
    <div style={{ display: "flex"}}>
      <input
        type="text"
        onFocus={onFocus}
        placeholder="行きたい場所をお気に入りに追加"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "10px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
        readOnly
      />
    </div>
  );
}

export default MapSearchBar;
