import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

function SearchBar({
  placeholder = "Vlogを検索",
  autoFocus = false,
  onBeforeSubmit,
}) {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dummyRef = useRef(null);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [autoFocus]);

  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
  const isAndroid =
    typeof navigator !== "undefined" &&
    /Android/i.test(navigator.userAgent || "");

  const closeKeyboardHard = () => {
    const el = inputRef.current;
    if (!el) return;

    el.blur();

    if (dummyRef.current && typeof dummyRef.current.focus === "function") {
      dummyRef.current.focus();
    }

    const prevReadOnly = el.readOnly;
    el.readOnly = true;
    setTimeout(() => {
      el.readOnly = prevReadOnly;
    }, 0);

    if (isIOS) {
      setTimeout(() => {
        try {
          window.scrollTo(0, 0);
        } catch (err) {
          console.debug("window.scrollTo failed (iOS workaround):", err);
        }
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const k = keyword.trim();
    if (!k) return;

    if (onBeforeSubmit) {
      try {
        await onBeforeSubmit();
      } catch (err) {
        console.debug("onBeforeSubmit threw, continuing submit:", err);
      }
    }

    closeKeyboardHard();

    const delay = isAndroid ? 50 : 0;
    setTimeout(() => {
      const q = `${k} Vlog`;
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }, delay);
  };

  return (
    <>
      <div
        ref={dummyRef}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      />
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="動画検索"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flex: 1,
          maxWidth: 640,
        }}
      >
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={placeholder}
          aria-label="検索キーワード"
          style={{
            flex: 1,
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            padding: "12px 16px",
            borderRadius: 9999,
            border: "1px solid #cfd5d9",
            outline: "none",
          }}
        />

        {!isMobile && (
          <button
            type="submit"
            aria-label="検索を実行"
            style={{
              flexShrink: 0,
              padding: "10px 16px",
              borderRadius: 9999,
              border: "none",
              background: "#2CA478",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            検索
          </button>
        )}

        <button type="submit" style={{ display: "none" }}>
          検索
        </button>
      </form>
    </>
  );
}

export default SearchBar;
