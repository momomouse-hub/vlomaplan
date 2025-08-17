import { useEffect, useRef, useState, memo } from "react";

function IconPillButton({
  label,
  iconSrc,
  iconAlt,
  badgeCount,
  onAction,
  pillWidth = 220,
  autoWidth = false,
  className,
}) {
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef(null);
  const labelRef = useRef(null);
  const lastPointerTypeRef = useRef(null);
  const ignoreClickUntilRef = useRef(0);

  useEffect(() => {
    if (!expanded) return;
    const onDocPointerDown = (e) => {
      if (lastPointerTypeRef.current !== "touch") return;
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setExpanded(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [expanded]);

  const [measuredWidth, setMeasuredWidth] = useState(pillWidth);
  useEffect(() => {
    if (!autoWidth || !expanded) return;
    const LABEL_RIGHT = 48;
    const LABEL_LEFT_PAD = 14;
    const EXTRA = 16;
    const base = (labelRef.current?.offsetWidth ?? 0) + LABEL_RIGHT + LABEL_LEFT_PAD + EXTRA;
    const w = Math.max(48, Math.min(360, base));
    setMeasuredWidth(w);
  }, [autoWidth, expanded, label]);

  const resolvedPillWidth = autoWidth ? measuredWidth : pillWidth;

  const width = expanded ? resolvedPillWidth : 48;
  const LABEL_RIGHT = 48;
  const LABEL_LEFT_PAD = 14;
  const labelMax = Math.max(0, resolvedPillWidth - LABEL_RIGHT - LABEL_LEFT_PAD);

  const handlePointerEnter = (e) => {
    if (e.pointerType !== "touch") {
      lastPointerTypeRef.current = e.pointerType;
      setExpanded(true);
    }
  };

  const handlePointerLeave = (e) => {
    if (e.pointerType !== "touch") {
      lastPointerTypeRef.current = e.pointerType;
      setExpanded(false);
    }
  };

  const handlePointerDown = (e) => {
    lastPointerTypeRef.current = e.pointerType || "mouse";
    if (e.pointerType === "touch") {
      if (!expanded) {
        setExpanded(true);
        ignoreClickUntilRef.current = Date.now() + 300;
      }
    }
  };

  const handleClick = () => {
    if (Date.now() < ignoreClickUntilRef.current) return;
    onAction?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onAction?.();
    }
  };

  const showBadge = typeof badgeCount === "number" && badgeCount > 0;

  return (
    <button
      ref={rootRef}
      type="button"
      className={["mapIconBtn", className].filter(Boolean).join(" ")}
      aria-label={label}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        position: "relative",
        height: 48,
        width,
        backgroundColor: "white",
        border: "2px solid #2CA478",
        borderRadius: 9999,
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(0,0,0,.12)",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        transition: "width 160ms ease, box-shadow 160ms ease",
        padding: 0,
        overflow: "visible",
      }}
    >
      <span
        ref={labelRef}
        style={{
          position: "absolute",
          right: LABEL_RIGHT,
          top: "50%",
          transform: "translateY(-50%)",
          opacity: expanded ? 1 : 0,
          transition: "opacity 160ms ease",
          transitionDelay: expanded ? "160ms" : "0ms",
          whiteSpace: "nowrap",
          maxWidth: expanded ? labelMax : 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          pointerEvents: "none",
          fontSize: 14,
        }}
      >
        {label}
      </span>

      <span
        style={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          display: "inline-block",
          width: 32,
          height: 32,
          pointerEvents: "none",
        }}
      >
        <img src={iconSrc} alt={iconAlt} style={{ width: 32, height: 32, display: "block" }} />
        {showBadge && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              background: "#e02424",
              color: "#fff",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              lineHeight: 1,
              pointerEvents: "none",
            }}
          >
            {badgeCount}
          </span>
        )}
      </span>
    </button>
  );
}

export default memo(IconPillButton);
