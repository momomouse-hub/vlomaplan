export function getPlaceId(p) {
  return p?.placeId ?? p?.place_id ?? null;
}
