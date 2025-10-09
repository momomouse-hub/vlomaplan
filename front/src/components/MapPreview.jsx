import { useEffect, useRef, useState, useCallback } from "react";
import { useMap, Map } from "@vis.gl/react-google-maps";
import CustomMarker from "./CustomMarker";
import IconPillButton from "./IconPillButton";
import MapPopup from "./MapPopup";
import PlaceDetailCard from "./PlaceDetailCard";
import TravelPlanModal from "./TravelPlanModal";
import PlanPickerModal from "./PlanPickerModal";
import PlanPanel from "./PlanPanel";
import WishlistPanel from "./WishlistPanel";
import { createBookmark } from "../api/bookmarks";
import {
  totalCountWishlists,
  wishlistsStatus,
  listWishlists,
  deleteWishlist,
} from "../api/wishlists";
import {
  listTravelPlans,
  listPlanItems,
  plansContainingPlace,
  removePlanItem,
} from "../api/travel_plans";
import { getPlaceId } from "../utils/place";
import {
  ensureMembershipsForPlaceIds,
  primePlanMembership,
  invalidatePlanMembership,
} from "../state/planMembershipCache";

function MapPreview({
  position,
  placeName,
  selectedPlace,
  currentVideo,
  onRequestExpand,
  mapHeight,
  onUnmask,
  onSelectPlace,
  onWishlistTotalChange,
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [savedPins, setSavedPins] = useState([]);
  const [planPins, setPlanPins] = useState([]);

  const [showWishlist, setShowWishlist] = useState(false);
  const [wlItems, setWlItems] = useState([]);
  const [wlNext, setWlNext] = useState(1);
  const [wlLoading, setWlLoading] = useState(false);
  const WL_PER = 10;

  const [isSavedGlobally, setIsSavedGlobally] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalFavCount, setTotalFavCount] = useState(0);

  const hasAnyFavorites = totalFavCount > 0;
  const [hasAnyPlans, setHasAnyPlans] = useState(false);

  const map = useMap();
  const prevH = useRef(mapHeight);
  const didAutoCenter = useRef(false);

  const [placeThumbUrl, setPlaceThumbUrl] = useState(null);
  const [currentWishlistId, setCurrentWishlistId] = useState(null);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planMembership, setPlanMembership] = useState(null);
  const [modalPlace, setModalPlace] = useState(null);
  const [planByPlaceId, setPlanByPlaceId] = useState({});
  const [modalSource, setModalSource] = useState(null);

  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [showPlanPanel, setShowPlanPanel] = useState(false);
  const [viewPlan, setViewPlan] = useState(null);
  const [viewPlanItems, setViewPlanItems] = useState([]);
  const [viewPlanLoading, setViewPlanLoading] = useState(false);
  const isViewingPlan = !!(showPlanPanel && viewPlan && Array.isArray(viewPlanItems));

  const refreshSavedPins = useCallback(async () => {
    try {
      const acc = [];
      let page = 1;
      const per = 200;
      for (;;) {
        const data = await listWishlists({ page, per });
        const items = data.items || [];
        acc.push(...items);
        const next = data.pagination?.next ?? null;
        if (!next) break;
        page = next;
        if (page > 50) break;
      }
      setSavedPins(
        acc
          .map((it) => ({ id: it.id, place: it.place }))
          .filter((it) => Number.isFinite(Number(it.place?.latitude)) && Number.isFinite(Number(it.place?.longitude)))
      );
    } catch (e) {
      console.warn("refreshSavedPins failed:", e);
    }
  }, []);

  const refreshPlanPins = useCallback(async () => {
    try {
      const plansRes = await listTravelPlans({ page: 1, per: 200 });
    const plans = plansRes.items || [];
      setHasAnyPlans(plans.length > 0);
      if (plans.length === 0) {
        setPlanPins([]);
        return;
      }

      const itemsArrays = await Promise.all(
        plans.map((p) => listPlanItems({ planId: p.id }).catch(() => ({ items: [] })))
      );

      const acc = [];
      itemsArrays.forEach((res, idx) => {
        const p = plans[idx];
        (res.items || []).forEach((item) => {
          acc.push({
            planId: p.id,
            planName: p.name,
            itemId: item.id,
            place: item.place,
          });
        });
      });

      const seen = new Set();
      const uniq = [];
      for (const it of acc) {
        const pid = getPlaceId(it.place);
        if (!pid) continue;
        if (seen.has(pid)) continue;
        seen.add(pid);
        uniq.push(it);
      }

      setPlanPins(
        uniq.filter(
          (it) =>
            Number.isFinite(Number(it.place?.latitude)) &&
            Number.isFinite(Number(it.place?.longitude))
        )
      );
    } catch (e) {
      console.warn("refreshPlanPins failed:", e);
    }
  }, []);

  const loadWishlist = useCallback(
    async (page = wlNext, per = WL_PER) => {
      if (wlLoading || page == null) return;
      setWlLoading(true);
      try {
        const data = await listWishlists({ page, per });
        setWlItems((prev) => prev.concat(data.items || []));
        setWlNext(data.pagination?.next ?? null);
      } catch (e) {
        console.error("Failed to load wishlists:", e);
      } finally {
        setWlLoading(false);
      }
    },
    [wlLoading, wlNext]
  );
  const handleLoadMore = useCallback(() => loadWishlist(), [loadWishlist]);

  const handleOpenWishlist = useCallback(async () => {
    onRequestExpand?.();
    onUnmask?.();
    setShowPlanPanel(false);
    setShowWishlist(true);
    setIsPopupOpen(false);
    setShowDetail(false);
    setWlLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        listWishlists({ page: 1, per: WL_PER }),
        totalCountWishlists(),
      ]);
      setWlItems(listRes.items || []);
      setWlNext(listRes.pagination?.next ?? null);
      setTotalFavCount(Number(countRes.totalCount || 0));
    } finally {
      setWlLoading(false);
    }
  }, [onRequestExpand, onUnmask]);

  const openPlanPicker = useCallback(() => {
    onRequestExpand?.();
    onUnmask?.();
    setShowWishlist(false);
    setShowPlanPicker(true);
  }, [onRequestExpand, onUnmask]);

  const loadViewPlanItems = useCallback(async (plan) => {
    setViewPlan(plan);
    setShowWishlist(false);
    setShowPlanPanel(true);
    setViewPlanLoading(true);
    try {
      const res = await listPlanItems({ planId: plan.id });
      const items = res.items || [];
      setViewPlanItems(items);

      const nextMap = {};
      items.forEach((it) => {
        const pid = getPlaceId(it.place);
        if (!pid) return;
        const mem = { planId: plan.id, planName: plan.name, itemId: it.id };
        primePlanMembership(pid, mem);
        nextMap[pid] = mem;
      });
      setPlanByPlaceId((prev) => ({ ...prev, ...nextMap }));
    } finally {
      setViewPlanLoading(false);
    }
  }, []);

  const handleChoosePlanToView = useCallback((plan) => {
    setShowPlanPicker(false);
    loadViewPlanItems(plan);
  }, [loadViewPlanItems]);

  const handleCloseWishlist = useCallback(() => setShowWishlist(false), []);

  const handleSelectWishlistItem = useCallback(
    (it) => {
      const lat = Number(it?.place?.latitude);
      const lng = Number(it?.place?.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        onSelectPlace?.({ ...it.place, placeId: getPlaceId(it.place) });
        map?.panTo({ lat, lng });
      }
      setShowWishlist(false);
    },
    [map, onSelectPlace]
  );

  const handleRemoveWishlist = useCallback(
    async (id) => {
      try {
        await deleteWishlist(id);
        setWlItems((prev) => prev.filter((it) => it.id !== id));
        setTotalFavCount((c) => Math.max(0, (c || 0) - 1));
        refreshSavedPins();
        if (currentWishlistId && currentWishlistId === id) {
          setIsSavedGlobally(false);
          setShowDetail(false);
          setCurrentWishlistId(null);
        }
      } catch (e) {
        console.error(e);
        alert("削除に失敗しました。");
      }
    },
    [currentWishlistId, refreshSavedPins]
  );

  const handleAddToPlanFromWishlist = useCallback(
    (item) => {
      const pid = getPlaceId(item?.place);
      setModalSource({ type: "wishlist", placeId: pid, wishlistId: item.id });
      setModalPlace({ ...item.place, placeId: pid });
      onRequestExpand?.();
      onUnmask?.();
      setShowPlanModal(true);
    },
    [onRequestExpand, onUnmask]
  );

  useEffect(() => {
    if (!map) return;
    const oldH = prevH.current;
    const newH = mapHeight;
    if (typeof oldH === "number" && typeof newH === "number" && oldH !== newH) {
      const dy = (newH - oldH) / 2;
      map.panBy(0, dy);
    }
    prevH.current = newH;
  }, [mapHeight, map]);

  useEffect(() => {
    (async () => {
      try {
        const { totalCount } = await totalCountWishlists();
        setTotalFavCount(Number(totalCount || 0));
      } catch (e) {
        console.warn("totalCount init failed:", e);
      }
    })();
  }, []);

  useEffect(() => {
    refreshSavedPins();
    refreshPlanPins();
  }, [refreshSavedPins, refreshPlanPins]);

  useEffect(() => {
    if (!wlItems?.length) return;
    const pids = wlItems.map((it) => getPlaceId(it.place)).filter(Boolean);
    (async () => {
      const mapNew = await ensureMembershipsForPlaceIds(pids);
      setPlanByPlaceId((prev) => ({ ...prev, ...mapNew }));
    })();
  }, [wlItems]);

  useEffect(() => {
    if (!savedPins?.length) return;
    const pids = savedPins.map((it) => getPlaceId(it.place)).filter(Boolean);
    (async () => {
      const mapNew = await ensureMembershipsForPlaceIds(pids);
      setPlanByPlaceId((prev) => ({ ...prev, ...mapNew }));
    })();
  }, [savedPins]);

  useEffect(() => {
    const pid = getPlaceId(selectedPlace);
    if (!pid) return;
    (async () => {
      try {
        const { saved, thumbnailUrl, wishlistId } = await wishlistsStatus({ placeId: pid });
        setIsSavedGlobally(!!saved);
        setPlaceThumbUrl(thumbnailUrl || null);
        setCurrentWishlistId(wishlistId ?? null);
      } catch (e) {
        console.warn("place_status init failed:", e);
        setIsSavedGlobally(false);
        setPlaceThumbUrl(null);
        setCurrentWishlistId(null);
      }
      try {
        const res = await plansContainingPlace({ placeId: pid });
        const first = (res?.plans || []).find((p) => p.hasPlace);
        if (first) {
          const mem = { planId: first.id, planName: first.name, itemId: first.itemId };
          setPlanMembership(mem);
          primePlanMembership(pid, mem);
          setPlanByPlaceId((prev) => ({ ...prev, [pid]: mem }));
        } else {
          setPlanMembership(null);
          primePlanMembership(pid, undefined);
          setPlanByPlaceId((prev) => {
            const next = { ...prev };
            delete next[pid];
            return next;
          });
        }
      } catch (e) {
        console.warn("plan contains init failed:", e);
        setPlanMembership(null);
      }
    })();
  }, [selectedPlace?.placeId]);

  useEffect(() => {
    setIsPopupOpen(false);
    if (map && Number.isFinite(position?.lat) && Number.isFinite(position?.lng)) {
      map.panTo({ lat: position.lat, lng: position.lng });
    }
  }, [position.lat, position.lng]);

  useEffect(() => {
    onWishlistTotalChange?.(totalFavCount);
  }, [totalFavCount, onWishlistTotalChange]);
  useEffect(() => {
    return () => onWishlistTotalChange?.(null);
  }, [onWishlistTotalChange]);

  useEffect(() => {
    if (didAutoCenter.current) return;
    if (totalFavCount > 0 && !selectedPlace) {
      (async () => {
        try {
          const res = await listWishlists({ page: 1, per: 1 });
          const latest = res?.items?.[0];
          const lat = Number(latest?.place?.latitude);
          const lng = Number(latest?.place?.longitude);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            const placeId = getPlaceId(latest.place);
            onSelectPlace?.({ ...latest.place, placeId });
            map?.panTo({ lat, lng });
            didAutoCenter.current = true;
          }
        } catch (e) {
          console.warn("auto-center failed:", e);
        }
      })();
    }
  }, [totalFavCount, selectedPlace, onSelectPlace, map]);

  const handleAddFavorite = async () => {
    if (!selectedPlace || !currentVideo || isSaving || isSavedGlobally) return;
    try {
      setIsSaving(true);
      await createBookmark({
        video_view: {
          youtube_video_id: currentVideo.id,
          title: currentVideo.title,
          thumbnailUrl: currentVideo.thumbnail,
          search_history_id: null,
        },
        place: {
          placeId: getPlaceId(selectedPlace),
          name: selectedPlace.name,
          address: selectedPlace.address,
          latitude: selectedPlace.latitude,
          longitude: selectedPlace.longitude,
        },
      });
      setIsSavedGlobally(true);
      try {
        const { totalCount } = await totalCountWishlists();
        setTotalFavCount(Number(totalCount || 0));
      } catch {}
      try {
        const { wishlistId, thumbnailUrl } = await wishlistsStatus({
          placeId: getPlaceId(selectedPlace),
        });
        setCurrentWishlistId(wishlistId ?? null);
        if (thumbnailUrl) setPlaceThumbUrl(thumbnailUrl);
      } catch {}
      refreshSavedPins();
      setIsPopupOpen(false);
      setShowDetail(true);
      onRequestExpand?.();
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました。通信状況をご確認ください。");
    } finally {
      setIsSaving(false);
    }
  };

  const containerHeight =
    mapHeight != null ? (typeof mapHeight === "number" ? `${mapHeight}px` : mapHeight) : "100%";

  const savedPidSet = new Set(savedPins.map((it) => getPlaceId(it.place)).filter(Boolean));
  const selectedPid = getPlaceId(selectedPlace);

  const isDockedOpen = isViewingPlan || showWishlist;

  const mapRowSize = "minmax(180px, 34%)";

  return (
    <div
      style={{
        height: containerHeight,
        width: "100%",
        display: "grid",
        gridTemplateRows: isDockedOpen ? `${mapRowSize} 1fr` : "1fr",
        gap: 12,
        position: "relative",
        minHeight: 0,
      }}
    >
      <div style={{ position: "relative", minHeight: 0 }}>
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            zIndex: 1100,
            alignItems: "flex-end",
          }}
        >
          <IconPillButton
            label="行きたい場所リストを表示"
            iconSrc={hasAnyFavorites ? "/filledheart.svg" : "/heart.svg"}
            iconAlt="行きたい場所リスト"
            badgeCount={totalFavCount}
            onAction={handleOpenWishlist}
          />
          <IconPillButton
            label="旅行プランを表示"
            iconSrc={hasAnyPlans ? "/filledluggage.svg" : "/luggage.svg"}
            iconAlt="旅行プラン"
            onAction={openPlanPicker}
          />
        </div>

        <Map
          defaultCenter={position}
          defaultZoom={14}
          options={{ disableDefaultUI: true }}
          mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
          style={{ height: "100%", width: "100%" }}
          onClick={() => {
            setIsPopupOpen(false);
            setShowDetail(false);
          }}
        >
          {isViewingPlan &&
            viewPlanItems
              .filter(
                (it) =>
                  Number.isFinite(Number(it?.place?.latitude)) &&
                  Number.isFinite(Number(it?.place?.longitude))
              )
              .sort((a, b) => {
                const ao = a.sortOrder ?? a.sort_order;
                const bo = b.sortOrder ?? b.sort_order;
                const sa = Number.isFinite(Number(ao)) ? Number(ao) : 0;
                const sb = Number.isFinite(Number(bo)) ? Number(bo) : 0;
                return sa - sb;
              })
              .map((it) => {
                const lat = Number(it.place.latitude);
                const lng = Number(it.place.longitude);
                const pid = getPlaceId(it.place);
                const isSelected = selectedPid && selectedPid === pid;
                const rawOrder = it.sortOrder ?? it.sort_order;
                const orderForDisplay = Number.isFinite(Number(rawOrder)) ? Number(rawOrder) + 1 : undefined;

                return (
                  <CustomMarker
                    key={`view-${viewPlan.id}-${it.id}`}
                    position={{ lat, lng }}
                    isFavorite={false}
                    isSelected={!!isSelected}
                    inPlan={true}
                    sortOrder={orderForDisplay}
                    forceNumberPin
                    onClick={() => {
                      setIsPopupOpen(false);
                      setIsSavedGlobally(false);
                      onSelectPlace?.({ ...it.place, placeId: pid });
                      setShowDetail(true);
                      onRequestExpand?.();
                      map?.panTo({ lat, lng });
                    }}
                  />
                );
              })}

          {!isViewingPlan && !isSavedGlobally && selectedPlace && (
            <CustomMarker
              position={position}
              isFavorite={false}
              isSelected={true}
              inPlan={!!planMembership}
              onClick={() => {
                if (planMembership) {
                  setIsPopupOpen(false);
                  setShowDetail(true);
                  onRequestExpand?.();
                } else {
                  setIsPopupOpen(true);
                  setShowDetail(false);
                }
              }}
            />
          )}

          {!isViewingPlan &&
            savedPins.map((it) => {
              const lat = Number(it.place.latitude);
              const lng = Number(it.place.longitude);
              if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

              const thisPlaceId = getPlaceId(it.place);
              const isSelected = selectedPid && selectedPid === thisPlaceId;

              return (
                <CustomMarker
                  key={`wl-${it.id}`}
                  position={{ lat, lng }}
                  isFavorite
                  isSelected={!!isSelected}
                  inPlan={Boolean(planByPlaceId[thisPlaceId])}
                  onClick={() => {
                    setIsPopupOpen(false);
                    setIsSavedGlobally(true);
                    onSelectPlace?.({ ...it.place, placeId: thisPlaceId });
                    setShowDetail(true);
                    onRequestExpand?.();
                    map?.panTo({ lat, lng });
                  }}
                />
              );
            })}

          {!isViewingPlan &&
            planPins
              .filter((it) => {
                const pid = getPlaceId(it.place);
                if (!pid) return false;
                if (savedPidSet.has(pid)) return false;
                if (selectedPid && pid === selectedPid) return false;
                return true;
              })
              .map((it) => {
                const lat = Number(it.place.latitude);
                const lng = Number(it.place.longitude);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

                const pid = getPlaceId(it.place);
                const isSelected = selectedPid && selectedPid === pid;

                return (
                  <CustomMarker
                    key={`plan-${it.planId}-${it.itemId}-${pid}`}
                    position={{ lat, lng }}
                    isFavorite={false}
                    isSelected={!!isSelected}
                    inPlan={true}
                    onClick={() => {
                      setIsPopupOpen(false);
                      setIsSavedGlobally(false);
                      onSelectPlace?.({ ...it.place, placeId: pid });
                      setShowDetail(true);
                      onRequestExpand?.();
                      map?.panTo({ lat, lng });
                    }}
                  />
                );
              })}

          {isPopupOpen && !isSavedGlobally && (
            <div
              style={{
                position: "absolute",
                top: "calc(50% - 150px)",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
              }}
            >
              <MapPopup
                title={placeName}
                message="行きたい場所リストに追加しますか？"
                confirmLabel={isSaving ? "保存中..." : "追加する"}
                cancelLabel="キャンセル"
                confirmDisabled={isSaving || !currentVideo?.id || !getPlaceId(selectedPlace)}
                onConfirm={handleAddFavorite}
                onCancel={() => setIsPopupOpen(false)}
              />
            </div>
          )}
        </Map>

        {showDetail && (isSavedGlobally || !!planMembership) && (
          <PlaceDetailCard
            variant="overlay"
            place={selectedPlace}
            thumbnailUrl={placeThumbUrl ?? currentVideo?.thumbnail ?? null}
            isSaved={isSavedGlobally}
            isSaving={isSaving}
            onAdd={() => {
              if (isSaving) return;
              const pid = getPlaceId(selectedPlace);
              if (!currentVideo?.id || !pid) {
                alert("追加できません（動画または場所情報が不足しています）。");
                return;
              }
              handleAddFavorite();
            }}
            onRemove={() => {
              if (currentWishlistId) {
                handleRemoveWishlist(currentWishlistId);
              } else {
                alert("削除対象のIDが取得できませんでした。");
              }
            }}
            onAddToPlan={() => {
              onRequestExpand?.();
              onUnmask?.();
              setModalSource({ type: "detail", placeId: getPlaceId(selectedPlace) });
              setModalPlace(selectedPlace);
              setShowPlanModal(true);
            }}
            planMembership={planMembership}
            onRemoveFromPlan={async () => {
              if (!planMembership) return;
              try {
                await removePlanItem({ planId: planMembership.planId, itemId: planMembership.itemId });
                const pid = getPlaceId(selectedPlace);
                invalidatePlanMembership(pid);
                setPlanMembership(null);
                setPlanByPlaceId((prev) => {
                  const next = { ...prev };
                  delete next[pid];
                  return next;
                });
                setPlanPins((prev) => prev.filter((it) => getPlaceId(it.place) !== pid));
              } catch (e) {
                console.error(e);
                alert("旅行プランから削除に失敗しました。");
              }
            }}
            onClose={() => setShowDetail(false)}
            thumbWidth={120}
            thumbHeight={100}
            overlayOffset="clamp(24px, 5vh, 56px)"
          />
        )}
      </div>

      {isViewingPlan && viewPlan && (
        <div style={{ minHeight: 0 }}>
          <PlanPanel
            variant="docked"
            plan={viewPlan}
            items={viewPlanItems}
            loading={viewPlanLoading}
            onClose={() => setShowPlanPanel(false)}
            onSelect={(it) => {
              const lat = Number(it?.place?.latitude);
              const lng = Number(it?.place?.longitude);
              if (Number.isFinite(lat) && Number.isFinite(lng)) {
                onSelectPlace?.({ ...it.place, placeId: getPlaceId(it.place) });
                map?.panTo({ lat, lng });
              }
            }}
            planByPlaceId={planByPlaceId}
            onRemoveFromPlan={async (itemId, placeId) => {
              try {
                await removePlanItem({ planId: viewPlan.id, itemId });
                setViewPlanItems((prev) => prev.filter((x) => x.id !== itemId));
                invalidatePlanMembership(placeId);
                setPlanByPlaceId((prev) => {
                  const next = { ...prev };
                  delete next[placeId];
                  return next;
                });
                setPlanPins((prev) => prev.filter((it) => getPlaceId(it.place) !== placeId));
                if (getPlaceId(selectedPlace) === placeId) {
                  setPlanMembership(null);
                  setShowDetail(false);
                }
              } catch (e) {
                console.error(e);
                alert("旅行プランからの削除に失敗しました。");
              }
            }}
          />
        </div>
      )}

      {!isViewingPlan && showWishlist && (
        <div style={{ minHeight: 0 }}>
          <WishlistPanel
            variant="docked"
            items={wlItems}
            loading={wlLoading}
            hasNext={wlNext != null}
            onLoadMore={handleLoadMore}
            onClose={handleCloseWishlist}
            onSelect={handleSelectWishlistItem}
            onRemove={handleRemoveWishlist}
            onAddToPlan={handleAddToPlanFromWishlist}
            totalCount={totalFavCount}
            planByPlaceId={planByPlaceId}
            onRemoveFromPlan={async (placeId) => {
              const mem = planByPlaceId[placeId];
              if (!mem) return;
              try {
                await removePlanItem({ planId: mem.planId, itemId: mem.itemId });
                invalidatePlanMembership(placeId);
                setPlanByPlaceId((prev) => {
                  const next = { ...prev };
                  delete next[placeId];
                  return next;
                });
                if (getPlaceId(selectedPlace) === placeId) setPlanMembership(null);
                setPlanPins((prev) => prev.filter((it) => getPlaceId(it.place) !== placeId));
              } catch (e) {
                console.error(e);
                alert("旅行プランからの削除に失敗しました。");
              }
            }}
          />
        </div>
      )}

      {showPlanModal && modalPlace && (
        <TravelPlanModal
          place={modalPlace}
          onClose={() => setShowPlanModal(false)}
          onAdded={({ planId, planName, itemId }) => {
            setShowPlanModal(false);
            const pid = modalSource?.placeId;
            if (pid) {
              const mem = { planId, planName, itemId };
              primePlanMembership(pid, mem);
              setPlanByPlaceId((prev) => ({ ...prev, [pid]: mem }));
              refreshPlanPins();
            }
            if (getPlaceId(selectedPlace) && getPlaceId(modalPlace) === getPlaceId(selectedPlace)) {
              setPlanMembership({ planId, planName, itemId });
              setShowDetail(true);
              onRequestExpand?.();
            }
          }}
        />
      )}

      {showPlanPicker && (
        <PlanPickerModal
          onClose={() => setShowPlanPicker(false)}
          onSelect={handleChoosePlanToView}
        />
      )}
    </div>
  );
}

export default MapPreview;
