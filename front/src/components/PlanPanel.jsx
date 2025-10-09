import PlaceDetailCard from "./PlaceDetailCard";
import { getPlaceId } from "../utils/place";

export default function PlanPanel({
  plan,                    // { id, name }
  items,                   // [{ id: itemId, place, thumbnailUrl?, sort_order? }, ...]
  loading,
  bottomOffset = "clamp(24px, 6vh, 64px)",
  onClose,
  onSelect,                // (item) => void
  onRemoveFromPlan,        // async (itemId, placeId) => void
  planByPlaceId,           // map[pid] = { planId, planName, itemId }
  variant = "overlay",     // "overlay" | "docked"
}) {
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
        height: "50vh",
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
        <div style={{ fontWeight: 700, fontSize: 16 }}>
          {plan?.name ?? "旅行プラン"}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
          {loading ? "読込中…" : `${items.length}件`}
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
          <div style={{ color: "#666" }}>このプランにはまだ場所がありません</div>
        )}

        {items.map((it) => {
          const pid = getPlaceId(it.place);
          const mem =
            planByPlaceId?.[pid] || { planId: plan.id, planName: plan.name, itemId: it.id };
          return (
            <PlaceDetailCard
              key={it.id}
              variant="inline"
              place={it.place}
              thumbnailUrl={it.thumbnailUrl}
              isSaved={false}
              isSaving={false}
              onAdd={undefined}
              onRemove={undefined}
              onAddToPlan={undefined}
              planMembership={mem}
              onRemoveFromPlan={() => onRemoveFromPlan?.(it.id, pid)}
              onRootClick={() => onSelect?.(it)}
            />
          );
        })}
      </div>
    </div>
  );
}
