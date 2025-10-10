import { plansContainingPlace } from "../api/travel_plans";

const TTL_MS = 30 * 1000;

const store = new Map();
const inflight = new Map();

function now() {
  return Date.now();
}

function isFresh(entry) {
  return entry && entry.expires > now();
}

export function getPlanMembership(placeId) {
  const ent = store.get(placeId);
  if (isFresh(ent)) return ent.value;
  return undefined;
}

export function primePlanMembership(placeId, membership) {
  store.set(placeId, { value: membership, expires: now() + TTL_MS });
}

export function invalidatePlanMembership(placeId) {
  store.delete(placeId);
}

async function fetchMembership(placeId) {
  const res = await plansContainingPlace({ placeId });
  const first = (res?.plans || []).find((p) => p.hasPlace);
  const mem = first ? { planId: first.id, planName: first.name, itemId: first.itemId } : undefined;
  primePlanMembership(placeId, mem);
  return mem;
}

export async function ensureMembershipForPlaceId(placeId) {
  if (!placeId) return undefined;

  const ent = store.get(placeId);
  if (isFresh(ent)) return ent.value;

  if (inflight.has(placeId)) {
    return inflight.get(placeId);
  }
  const p = fetchMembership(placeId).finally(() => inflight.delete(placeId));
  inflight.set(placeId, p);
  return p;
}

export async function ensureMembershipsForPlaceIds(placeIds = []) {
  const unique = Array.from(new Set(placeIds.filter(Boolean)));
  const promises = unique.map(async (pid) => {
    const v = await ensureMembershipForPlaceId(pid);
    return [pid, v];
  });
  const entries = await Promise.all(promises);

  const map = {};
  entries.forEach(([pid, v]) => {
    map[pid] = v;
  });
  return map;
}
