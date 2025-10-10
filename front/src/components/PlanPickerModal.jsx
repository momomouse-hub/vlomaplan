import { useEffect, useMemo, useRef, useState } from "react";
import { listTravelPlans } from "../api/travel_plans";

export default function PlanPickerModal({ onClose, onSelect }) {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(null);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listTravelPlans({ page: 1, per: 200 });
        if (!mounted) return;
        const items = res.items || [];
        setPlans(items);
        setSelectedId(items[0]?.id ?? null);
        setTimeout(() => firstFocusRef.current?.focus(), 0);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "読み込みに失敗しました");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedId) || null,
    [plans, selectedId]
  );

  function handleSubmit() {
    if (!selectedPlan) return;
    onSelect?.({ id: selectedPlan.id, name: selectedPlan.name });
  }

  let bodyContent = null;
  if (loading) {
    bodyContent = <div style={{ padding: 12, color: "#666" }}>読み込み中…</div>;
  } else if (plans.length === 0) {
    bodyContent = <div style={{ padding: 12, color: "#666" }}>プランが見つかりません</div>;
  } else {
    bodyContent = (
      <select
        ref={firstFocusRef}
        value={selectedId ?? ""}
        onChange={(e) => setSelectedId(Number(e.target.value))}
        style={{ width: "100%", border: "1px solid #eee", borderRadius: 10, padding: "10px" }}
        aria-label="旅行プランの選択"
      >
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} {typeof p.itemsCount === "number" ? `（${p.itemsCount}件）` : ""}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="旅行プランを選択"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <button
        type="button"
        aria-label="閉じる（背景）"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.4)",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "default",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "min(520px, 96vw)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 10px 24px rgba(0,0,0,.25)",
          padding: 16,
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>どの旅行プランを表示しますか？</div>
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            style={{
              marginLeft: "auto",
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

        {error && <div style={{ marginTop: 10, color: "#d00", fontSize: 13 }}>{error}</div>}

        <div style={{ marginTop: 10 }}>{bodyContent}</div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#333" }}>
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedPlan}
            style={{
              background: "#2CA478",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 999,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            このプランを表示
          </button>
        </div>
      </div>
    </div>
  );
}
