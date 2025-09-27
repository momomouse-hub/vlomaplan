import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar({
  placeholder = "Vlogを検索",
  autoFocus = false,
  onBeforeSubmit, // 送信直前に実行したい処理があれば渡す
}) {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // モバイルSafari対策も兼ねて、マウント後に明示フォーカス
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [autoFocus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const k = keyword.trim();
    if (!k) return;

    if (onBeforeSubmit) {
      await onBeforeSubmit();
    }

    const modifiedKeyword = `${k} Vlog`;
    navigate(`/search?q=${encodeURIComponent(modifiedKeyword)}`);
  };

  return (
    <form onSubmit={handleSubmit} role="search" aria-label="動画検索">
      <input
        ref={inputRef}
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="検索キーワード"
        style={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          padding: "12px 16px",
          borderRadius: 9999,
          border: "1px solid #cfd5d9",
          outline: "none",
        }}
      />
      {/* Enter送信を安定させるために隠しsubmitボタンを置く */}
      <button type="submit" style={{ display: "none" }}>
        検索
      </button>
    </form>
  );
}

export default SearchBar;
