import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

/**
 * ヘッダー等で使う汎用検索バー。
 * ポリシー：
 * - モバイル：ボタン非表示（キーボードの「検索」キーで送信）
 * - デスクトップ：送信ボタンを表示（アクセシビリティと発見性のため）
 * - 送信時は iOS/Android でも確実にキーボードを閉じてから遷移
 */
function SearchBar({
  placeholder = "Vlogを検索",
  autoFocus = false,      // デフォルト false（ヘッダーからは付けない）
  onBeforeSubmit,         // 任意：トラッキング等のフック
}) {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dummyRef = useRef(null); // 非入力要素に一時フォーカス（KBクローズ保険）
  const isMobile = useIsMobile(768);

  // 必要なときだけ（例：TopQuickStartOverlay）自動フォーカス可
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

    // まず blur
    el.blur();

    // 非入力要素に一時フォーカス（KBを確実に閉じる）
    if (dummyRef.current && typeof dummyRef.current.focus === "function") {
      dummyRef.current.focus();
    }

    // 一瞬 readonly（再フォーカス抑制：iOS/Android両対応）
    const prevReadOnly = el.readOnly;
    el.readOnly = true;
    setTimeout(() => {
      el.readOnly = prevReadOnly;
    }, 0);

    // iOSのビューポートズレ保険
    if (isIOS) {
      setTimeout(() => {
        try { window.scrollTo(0, 0); } catch (_) {}
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const k = keyword.trim();
    if (!k) return;

    if (onBeforeSubmit) {
      try { await onBeforeSubmit(); } catch (_) {}
    }

    // まず確実にキーボードを閉じる
    closeKeyboardHard();

    // Androidは少し遅らせると安定
    const delay = isAndroid ? 50 : 0;
    setTimeout(() => {
      const q = `${k} Vlog`;
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }, delay);
  };

  return (
    <>
      {/* キーボードを閉じるための一時フォーカス先（画面には出ない） */}
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
          autoFocus={autoFocus} // ← propsを尊重（ヘッダーでは通常false）
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

        {/* デスクトップのみ、明示的な「検索」ボタンを表示 */}
        {!isMobile && (
          <button
            type="submit"
            aria-label="検索を実行"
            // onMouseDownでのフォーカス移動は handleSubmit 内の closeKeyboardHard で対策済み
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

        {/* Enter送信用の隠しボタン（モバイルでの挙動安定用） */}
        <button type="submit" style={{ display: "none" }}>
          検索
        </button>
      </form>
    </>
  );
}

export default SearchBar;
