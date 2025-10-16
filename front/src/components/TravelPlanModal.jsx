import { useEffect, useMemo, useState, useRef } from "react";
import {
  listTravelPlans,
  createTravelPlan,
  plansContainingPlace,
  addPlaceToPlan,
} from "../api/travel_plans";
import { ensureVisitor } from "../api/identity";

const NEW_VALUE = "__new__";

export default function TravelPlanModal({ place, onClose, onAdded }) {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [containsMap, setContainsMap] = useState({});
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [creating, setCreating] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const newNameRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const placeId = place?.placeId;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        try {
          await ensureVisitor();
        } catch (e) {
          console.debug("ensureVisitor failed (ignored):", e);
        }
        const [plansRes, containsRes] = await Promise.all([
          listTravelPlans({ page: 1, per: 200 }),
          placeId
            ? plansContainingPlace({ placeId })
            : Promise.resolve({ plans: [], placeExists: false }),
        ]);
        if (!mounted) return;

        const ps = plansRes.items || [];
        const map = {};
        (containsRes.plans || []).forEach((p) => {
          map[p.id] = { hasPlace: !!p.hasPlace, itemId: p.itemId, name: p.name };
        });

        setPlans(ps);
        setContainsMap(map);

        const firstHas = (containsRes.plans || []).find((p) => p.hasPlace);
        if (firstHas) {
          setSelectedPlanId(firstHas.id);
        } else {
          setSelectedPlanId(ps.length > 0 ? ps[0].id : NEW_VALUE);
          if (ps.length === 0) setTimeout(() => newNameRef.current?.focus(), 0);
        }
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
  }, [placeId]);

  const selectedPlanName = useMemo(() => {
    if (selectedPlanId === NEW_VALUE) return newPlanName.trim();
    return (
      plans.find((p) => p.id === selectedPlanId)?.name ||
      containsMap[selectedPlanId]?.name ||
      ""
    );
  }, [plans, containsMap, selectedPlanId, newPlanName]);

  function handleSelectChange(e) {
    const val = e.target.value === NEW_VALUE ? NEW_VALUE : Number(e.target.value);
    setSelectedPlanId(val);
    if (val === NEW_VALUE) setTimeout(() => newNameRef.current?.focus(), 0);
  }

  async function handleCreateOnly() {
    if (!newPlanName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await createTravelPlan({ name: newPlanName.trim() });
      setPlans((prev) => [{ id: res.id, name: res.name, itemsCount: 0 }, ...prev]);
      setSelectedPlanId(res.id);
      setNewPlanName("");
    } catch (e) {
      setError(e?.data?.error || e?.message || "プラン作成に失敗しました");
    } finally {
      setCreating(false);
    }
  }

  async function handleSubmit() {
    if (selectedPlanId === NEW_VALUE) {
      if (!newPlanName.trim()) {
        setError("新しいプラン名を入力してください");
        newNameRef.current?.focus();
        return;
      }
      setSubmitting(true);
      setError(null);
      try {
        const created = await createTravelPlan({ name: newPlanName.trim() });
        const added = await addPlaceToPlan({
          planId: created.id,
          place: {
            placeId: place.placeId,
            name: place.name,
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
          },
        });
        onAdded?.({ planId: created.id, planName: created.name, itemId: added?.id });
      } catch (e) {
        setError(e?.data?.error || e?.message || "追加に失敗しました");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!selectedPlanId || !place?.placeId) return;
    const preset = containsMap[selectedPlanId];
    if (preset?.hasPlace && preset?.itemId) {
      onAdded?.({ planId: selectedPlanId, planName: selectedPlanName, itemId: preset.itemId });
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const added = await addPlaceToPlan({
        planId: selectedPlanId,
        place: {
          placeId: place.placeId,
          name: place.name,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
        },
      });
      onAdded?.({ planId: selectedPlanId, planName: selectedPlanName, itemId: added?.id });
    } catch (e) {
      setError(e?.data?.error || e?.message || "追加に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="旅行プランに追加"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
          width: "min(560px, 96vw)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 10px 24px rgba(0,0,0,.25)",
          padding: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>どのプランに追加しますか？</div>
          <button
            type="button"
            aria-label="close"
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

        <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
          追加対象：<b>{place?.name ?? "-"}</b>
        </div>

        <div style={{ marginTop: 12 }}>
          {loading ? (
            <div style={{ padding: 12, color: "#666" }}>読み込み中…</div>
          ) : (
            <select
              value={selectedPlanId ?? ""}
              onChange={handleSelectChange}
              style={{ width: "100%", border: "1px solid #eee", borderRadius: 10, padding: "10px", fontSize: 16 }}
              aria-label="旅行プランの選択"
            >
              <option value={NEW_VALUE}>＋ 新しいプランを作成…</option>
              {plans.map((p) => {
                const hit = containsMap[p.id];
                const already = !!hit?.hasPlace;
                const suffix = already ? "（この場所は追加済み）" : "";
                return (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {suffix}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        {selectedPlanId === NEW_VALUE && (
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <input
              ref={newNameRef}
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="新しいプラン名を入力"
              aria-label="新しいプラン名"
              style={{ flex: 1, border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px", fontSize: 16 }}
            />
            <button
              type="button"
              onClick={handleCreateOnly}
              disabled={!newPlanName.trim() || creating}
              style={{
                background: "#eee",
                border: "none",
                borderRadius: 999,
                padding: "8px 12px",
                cursor: creating ? "default" : "pointer",
                opacity: creating ? 0.6 : 1,
              }}
            >
              {creating ? "作成中…" : "作成"}
            </button>
          </div>
        )}

        {error && <div style={{ marginTop: 10, color: "#d00", fontSize: 13 }}>{error}</div>}

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#333" }}>
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || submitting || (!selectedPlanId && selectedPlanId !== 0)}
            style={{
              background: "#2CA478",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 999,
              fontWeight: 700,
              cursor: "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "追加中…" : "このプランに追加"}
          </button>
        </div>
      </div>
    </div>
  );
}
