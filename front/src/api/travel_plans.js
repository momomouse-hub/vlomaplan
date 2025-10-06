import { apiFetch, apiFetchJson } from "./client";
const base = import.meta.env.VITE_API_BASE_URL || "";

export async function listTravelPlans({ page = 1, per = 50 } = {}) {
  const url = new URL(`${base}/api/travel_plans`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per", String(per));
  return apiFetchJson(url.toString());
}

export async function createTravelPlan({ name }) {
  return apiFetchJson(`${base}/api/travel_plans`, {
    method: "POST",
    body: { name },
  });
}

export async function plansContainingPlace({ placeId }) {
  const url = new URL(`${base}/api/travel_plans/contains`);
  url.searchParams.set("place_id", placeId);
  return apiFetchJson(url.toString());
}

export async function listPlanItems({ planId }) {
  return apiFetchJson(`${base}/api/travel_plans/${planId}/items`);
}

export async function addPlaceToPlan({ planId, place }) {
  return apiFetchJson(`${base}/api/travel_plans/${planId}/items`, {
    method: "POST",
    body: { place },
  });
}

export async function removePlanItem({ planId, itemId }) {
  const res = await apiFetch(`${base}/api/travel_plans/${planId}/items/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) throw new Error(`removePlanItem failed: ${res.status}`);
  return null;
}

export async function reorderPlanItems({ planId, items }) {
  return apiFetchJson(`${base}/api/travel_plans/${planId}/items/reorder`, {
    method: "PATCH",
    body: { items },
  });
}
