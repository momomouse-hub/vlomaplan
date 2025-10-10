import { useEffect, useRef } from "react";
import PlaceDetailCard from "./PlaceDetailCard";
import { getPlaceId } from "../utils/place";

export default function WishlistPanel({
  items,
  loading,
  hasNext,
  onLoadMore,
  onClose,
  onSelect,
  onRemove,
  onAddToPlan,
  totalCount,
  planByPlaceId,
  onRemoveFromPlan,
  variant = "docked",
  bottomOffset = "clamp(24px, 6vh, 64px)",
  heightPx = 280,
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasNext || loading) {
      return () => {};
    }
    const el = sentinelRef.current;
    if (!el) {
      return () => {};
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) onLoadMore?.();
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNext, loading, onLoadMore]);

  const isDocked = variant === "docked";

  const containerStyle = isDocked
    ? {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 6px 16px rgba(0,0,0,.12)",
        border: "1px solid #eee",
        overflow: "hidden",
      }
    : {
        position: "absolute",
        left: "2.5%",
        right: "2.5%",
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${bottomOffset})`,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 10px 24px rgba(0,0,0,.2)",
        zIndex: 3000,
        display: "flex",
        flexDirection: "column",
        height: heightPx ?? "50vh",
        overflow: "hidden",
      };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") e.stopPropagation();
      }}
      style={containerStyle}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: 12,
          borderBottom: "1px solid #eee",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16 }}>行きたい場所リスト</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
          {(Number.isFinite(totalCount) ? totalCount : items.length)}件
          {loading ? "(読込中)" : ""}
        </div>
        <button
          type="button"
          aria-label="close"
          onClick={onClose}
          style={{
            marginLeft: 8,
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
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 12, gap: 10, display: "grid" }}>
        {items.length === 0 && !loading && (
          <div style={{ color: "#666" }}>まだ保存がありません</div>
        )}

        {items.map((it) => {
          const pid = getPlaceId(it.place);
          return (
            <PlaceDetailCard
              key={it.id}
              variant="inline"
              place={it.place}
              thumbnailUrl={it.thumbnailUrl}
              isSaved
              isSaving={false}
              onRemove={() => onRemove?.(it.id)}
              onAddToPlan={() => onAddToPlan?.(it)}
              planMembership={planByPlaceId?.[pid]}
              onRemoveFromPlan={() => onRemoveFromPlan?.(pid)}
              onRootClick={() => onSelect?.(it)}
            />
          );
        })}

        <div ref={sentinelRef} style={{ height: 1 }} />
        {loading && (
          <div style={{ padding: "8px 0", textAlign: "center", color: "#666" }}>
            読み込み中…
          </div>
        )}
        {!hasNext && items.length > 0 && (
          <div style={{ padding: "6px 0", textAlign: "center", color: "#999", fontSize: 12 }}>
            以上です
          </div>
        )}
      </div>
    </div>
  );
}
