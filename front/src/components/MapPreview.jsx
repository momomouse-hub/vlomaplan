import { useEffect, useRef, useState, useCallback } from "react";
import { useMap, Map } from "@vis.gl/react-google-maps";
import CustomMarker from "./CustomMarker";
import IconPillButton from "./IconPillButton";
import MapPopup from "./MapPopup";
import PlaceDetailCard from "./PlaceDetailCard";
import TravelPlanModal from "./TravelPlanModal";
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

function WishlistPanel({
  heightPx = 280,
  bottomOffset = "clamp(24px, 6vh, 64px)",
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
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasNext || loading) return () => {};
    const el = sentinelRef.current;
    if (!el) return () => {};
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) onLoadMore();
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNext, loading, onLoadMore]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") e.stopPropagation();
      }}
      style={{
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
        height: heightPx ? heightPx : "50vh",
        overflow: "hidden",
      }}
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
        {items.length === 0 && !loading && <div style={{ color: "#666" }}>まだ保存がありません</div>}

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
              onRootClick={() => onSelect(it)}
            />
          );
        })}

        <div ref={sentinelRef} style={{ height: 1 }} />
        {loading && <div style={{ padding: "8px 0", textAlign: "center", color: "#666" }}>読み込み中…</div>}
        {!hasNext && items.length > 0 && (
          <div style={{ padding: "6px 0", textAlign: "center", color: "#999", fontSize: 12 }}>以上です</div>
        )}
      </div>
    </div>
  );
}

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

  const [isSaved] = useState(false);
  const hasAnyFavorites = totalFavCount > 0;

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
  }, [loadWishlist, onRequestExpand]);

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
      const map = await ensureMembershipsForPlaceIds(pids);
      setPlanByPlaceId((prev) => ({ ...prev, ...map }));
    })();
  }, [wlItems]);

  useEffect(() => {
    if (!savedPins?.length) return;
    const pids = savedPins.map((it) => getPlaceId(it.place)).filter(Boolean);
    (async () => {
      const map = await ensureMembershipsForPlaceIds(pids);
      setPlanByPlaceId((prev) => ({ ...prev, ...map }));
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

  return (
    <div style={{ height: containerHeight, width: "100%", position: "relative" }}>
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
          iconAlt="いきたい場所リスト"
          badgeCount={totalFavCount}
          onAction={handleOpenWishlist}
        />
        <IconPillButton
          label="旅行プランを表示"
          iconSrc={"/filledluggage.svg"}
          iconAlt="旅行プラン"
          onAction={() => {
            onUnmask?.();
            alert("旅行プラン機能は準備中です");
          }}
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
        {!isSavedGlobally && selectedPlace && (
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

        {savedPins.map((it) => {
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

        {planPins
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

      {showWishlist && (
        <WishlistPanel
          bottomOffset="clamp(24px, 6vh, 64px)"
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
      )}
    </div>
  );
}

export default MapPreview;
