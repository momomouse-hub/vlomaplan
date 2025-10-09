import { useEffect, useState } from "react";
import PlaceDetailCard from "./PlaceDetailCard";
import { getPlaceId } from "../utils/place";
import { reorderPlanItems } from "../api/travel_plans";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function PlanPanel({
  plan,
  items,
  loading,
  bottomOffset = "clamp(24px, 6vh, 64px)",
  onClose,
  onSelect,
  onRemoveFromPlan,
  planByPlaceId,
  wishlistByPlaceId,
  onAddWishlist,
  onRemoveWishlist,
  variant = "overlay",
  onItemsReordered,
  onDeletePlan,
}) {
  const isDocked = variant === "docked";
  const [isSorting, setIsSorting] = useState(false);
  const [ordered, setOrdered] = useState(items || []);
  const [savingItemIds, setSavingItemIds] = useState(new Set());

  useEffect(() => {
    if (!isSorting) setOrdered(items || []);
  }, [items, isSorting]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

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

  const withSaving = (itemId, fn) => async () => {
    if (!fn) return;
    if (savingItemIds.has(itemId)) return;
    setSavingItemIds((prev) => new Set(prev).add(itemId));
    try {
      await fn();
    } finally {
      setSavingItemIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  function SortableRow({ id, index, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: isSorting ? "grab" : "default",
      opacity: isDragging ? 0.9 : 1,
      background: isDragging ? "#fafafa" : "transparent",
      borderRadius: 12,
      display: "grid",
      gridTemplateColumns: "28px 1fr",
      alignItems: "start",
      gap: 8,
      padding: 2,
    };
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...(isSorting ? { ...attributes, ...listeners } : {})}
      >
        <div
          aria-hidden
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            background: "#2ca478",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            display: "grid",
            placeItems: "center",
            marginTop: 6,
            userSelect: "none",
          }}
          title={`順序 ${index + 1}`}
        >
          {index + 1}
        </div>
        {children}
      </div>
    );
  }

  async function commitReorder(nextArr, prevArr) {
    const nextSynced = nextArr.map((it, i) => ({
      ...it,
      sort_order: i,
      sortOrder: i,
    }));
    const payload = nextSynced.map((it) => ({ id: it.id, sort_order: it.sort_order }));

    try {
      setOrdered(nextSynced);
      onItemsReordered?.(nextSynced);
      await reorderPlanItems({ planId: plan.id, items: payload });
    } catch (e) {
      console.error(e);
      alert("並べ替えの保存に失敗しました。ネットワーク状況をご確認ください。");
      setOrdered(prevArr);
      onItemsReordered?.(prevArr);
    }
  }

  function onDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const prev = ordered;
    const oldIndex = prev.findIndex((x) => x.id === active.id);
    const newIndex = prev.findIndex((x) => x.id === over.id);
    const next = arrayMove(prev, oldIndex, newIndex).map((x) => x);
    commitReorder(next, prev);
  }

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
        <div style={{ fontWeight: 700, fontSize: 16 }}>{plan?.name ?? "旅行プラン"}</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
          {loading ? "読込中…" : `${ordered.length}件`}
        </div>
        <button
          type="button"
          onClick={() => setIsSorting((v) => !v)}
          style={{
            marginLeft: 8,
            background: isSorting ? "#2ca478" : "#f2f2f2",
            color: isSorting ? "#fff" : "#222",
            border: "none",
            height: 28,
            padding: "0 10px",
            borderRadius: 14,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {isSorting ? "完了" : "並べ替える"}
        </button>
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

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          gap: 10,
          display: "grid",
          alignContent: "start",
        }}
      >
        {ordered.length === 0 && !loading && (
          <div style={{ color: "#666" }}>このプランにはまだ場所がありません</div>
        )}

        {isSorting ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={ordered.map((x) => x.id)} strategy={verticalListSortingStrategy}>
              {ordered.map((it, idx) => {
                const pid = getPlaceId(it.place);
                const mem =
                  planByPlaceId?.[pid] || { planId: plan.id, planName: plan.name, itemId: it.id };
                const wishlistId = wishlistByPlaceId?.[pid];
                const isSaving = savingItemIds.has(it.id);

                return (
                  <SortableRow key={it.id} id={it.id} index={idx}>
                    <PlaceDetailCard
                      variant="inline"
                      place={it.place}
                      thumbnailUrl={it.thumbnailUrl}
                      isSaved={!!wishlistId}
                      isSaving={isSaving}
                      onAdd={
                        wishlistId
                          ? undefined
                          : withSaving(it.id, async () => {
                              await onAddWishlist?.(it.place);
                            })
                      }
                      onRemove={wishlistId ? () => onRemoveWishlist?.(wishlistId) : undefined}
                      onAddToPlan={undefined}
                      planMembership={mem}
                      onRemoveFromPlan={undefined}
                      onRootClick={undefined}
                    />
                  </SortableRow>
                );
              })}
            </SortableContext>
          </DndContext>
        ) : (
          ordered.map((it, idx) => {
            const pid = getPlaceId(it.place);
            const mem =
              planByPlaceId?.[pid] || { planId: plan.id, planName: plan.name, itemId: it.id };
            const wishlistId = wishlistByPlaceId?.[pid];
            const isSaving = savingItemIds.has(it.id);

            return (
              <div
                key={it.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  alignItems: "start",
                  gap: 8,
                }}
              >
                <div
                  aria-hidden
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: "#f2f2f2",
                    color: "#2ca478",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                    marginTop: 6,
                    userSelect: "none",
                  }}
                  title={`順序 ${idx + 1}`}
                >
                  {idx + 1}
                </div>
                <PlaceDetailCard
                  variant="inline"
                  place={it.place}
                  thumbnailUrl={it.thumbnailUrl}
                  isSaved={!!wishlistId}
                  isSaving={isSaving}
                  onAdd={
                    wishlistId
                      ? undefined
                      : withSaving(it.id, async () => {
                          await onAddWishlist?.(it.place);
                        })
                  }
                  onRemove={wishlistId ? () => onRemoveWishlist?.(wishlistId) : undefined}
                  onAddToPlan={undefined}
                  planMembership={mem}
                  onRemoveFromPlan={() => onRemoveFromPlan?.(it.id, pid)}
                  onRootClick={() => onSelect?.(it)}
                />
              </div>
            );
          })
        )}

        {!!plan?.id && (
          <>
            <hr style={{ border: 0, borderTop: "1px solid #eee", margin: "6px 0 12px" }} />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => {
                  const ok = window.confirm(
                    `「${plan.name}」を削除します。よろしいですか？（元に戻せません）`
                  );
                  if (!ok) return;
                  onDeletePlan?.(plan);
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #c62828",
                  background: "#fff",
                  color: "#c62828",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                このプランを削除する
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
