import { useEffect, useRef, useState, useCallback } from "react";
import { useMap, Map } from "@vis.gl/react-google-maps";
import CustomMarker from "./CustomMarker";
import IconPillButton from "./IconPillButton";
import MapPopup from "./MapPopup";
import PlaceDetailCard from "./PlaceDetailCard";
import { createBookmark } from "../api/bookmarks";
import { totalCountWishlists, wishlistsStatus, listWishlists, deleteWishlist } from "../api/wishlists";

const MapPreview = ({
  position,
  placeName,
  selectedPlace,
  currentVideo,
  onRequestExpand,
  mapHeight,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // ▼ Wishlist パネル用
  const [showWishlist, setShowWishlist] = useState(false);
  const [wlItems, setWlItems] = useState([]);
  const [wlNext, setWlNext] = useState(1);   // 次に読む page（null なら終端）
  const [wlLoading, setWlLoading] = useState(false);
  const WL_PER = 10;

  const [isSavedGlobally, setIsSavedGlobally] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalFavCount, setTotalFavCount] = useState(0);

  const [isSaved, setIsSaved] = useState(false);
  const hasAnyFavorites = totalFavCount > 0;

  const map = useMap();
  const prevH = useRef(mapHeight);

  const [placeThumbUrl, setPlaceThumbUrl] = useState(null);
  const [currentWishlistId, setCurrentWishlistId] = useState(null);

  // ▼ Wishlist 読み込み
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

  // ▼ ピルクリック：モーダル最大化→パネル表示→未取得なら1ページ読む
  const handleOpenWishlist = useCallback(
    async () => {
      onRequestExpand?.();
      setShowWishlist(true);
      setIsPopupOpen(false);
      setShowDetail(false);
      if (wlItems.length === 0) {
        await loadWishlist(1, WL_PER);
      }
    },
    [wlItems.length, loadWishlist, onRequestExpand]
  );

  const handleCloseWishlist = useCallback(() => {
    setShowWishlist(false);
  }, []);

  // ▼ リストアイテム選択時：地図をその場所へパンしてパネルを閉じる
  const handleSelectWishlistItem = useCallback(
    (it) => {
      const lat = Number(it?.place?.latitude);
      const lng = Number(it?.place?.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng) && map) {
        map.panTo({ lat, lng });
      }
      setShowWishlist(false);
    },
    [map]
  );

  // ▼ 旅行プランに追加（仮実装）
  const handleRemoveWishlist = useCallback(async (id) => {
    try {
      await deleteWishlist(id);
      setWlItems((prev) => prev.filter((it) => it.id !== id));
      setTotalFavCount((c) => Math.max(0, (c || 0) - 1));
      if (currentWishlistId && currentWishlistId === id) {
        setIsSavedGlobally(false);
        setShowDetail(false);
        setCurrentWishlistId(null);
      }
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました。");
    }
  }, [currentWishlistId]);

  // ▼ 削除（仮実装：まずは表示確認）
  const handleAddToPlanFromWishlist = useCallback((item) => {
    console.log("[Wishlist] add-to-plan click:", item);
    alert(`旅行プランに追加（仮）: ${item.place?.name ?? "(no name)"}`);
  }, []);

  // 地図高さ変化時のパン
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

  // 合計カウント初期化
  useEffect(() => {
    (async () => {
      try {
        const { total_count } = await totalCountWishlists();
        setTotalFavCount(Number(total_count || 0));
      } catch (e) {
        console.warn("total_count init failed:", e);
      }
    })();
  }, []);

  // 選択中placeの保存状態とサムネ初期化
  useEffect(() => {
    const pid = selectedPlace?.place_id;
    if (!pid) return;
    (async () => {
      try {
        const { saved, thumbnail_url, wishlist_id } = await wishlistsStatus({ place_id: pid });
        setIsSavedGlobally(!!saved);
        setPlaceThumbUrl(thumbnail_url || null);
        setCurrentWishlistId(wishlist_id ?? null);
      } catch (e) {
        console.warn("place_status init failed:", e);
        setIsSavedGlobally(false);
        setPlaceThumbUrl(null);
        setCurrentWishlistId(null);
      }
    })();
  }, [selectedPlace?.place_id]);

  // 地図クリックなどで詳細/ポップアップ閉じ
  useEffect(() => {
    setIsPopupOpen(false);
    setShowDetail(false);
  }, [selectedPlace?.place_id, position.lat, position.lng]);

  const handleAddFavorite = async () => {
    if (!selectedPlace || !currentVideo || isSaving || isSavedGlobally) return;
    try {
      setIsSaving(true);
      await createBookmark({
        video_view: {
          youtube_video_id: currentVideo.id,
          title: currentVideo.title,
          thumbnail_url: currentVideo.thumbnail,
          search_history_id: null,
        },
        place: {
          place_id: selectedPlace.place_id,
          name: selectedPlace.name,
          address: selectedPlace.address,
          latitude: selectedPlace.latitude,
          longitude: selectedPlace.longitude,
        },
      });
      setIsSavedGlobally(true);
      try {
        const { total_count } = await totalCountWishlists();
        setTotalFavCount(Number(total_count || 0));
      } catch { }
      try {
        const { wishlist_id, thumbnail_url } = await wishlistsStatus({ place_id: selectedPlace.place_id });
        setCurrentWishlistId(wishlist_id ?? null);
        if (thumbnail_url) setPlaceThumbUrl(thumbnail_url);
      } catch { }
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

  // ▼ 下部リスト（PlaceDetailCard の inline 版で描画）
  function WishlistPanel({
    heightPx = 280,
    items,
    loading,
    hasNext,
    onLoadMore,
    onClose,
    onSelect,
    onRemove,
    onAddToPlan,
  }) {
    const sentinelRef = useRef(null);

    useEffect(() => {
      if (!hasNext || loading) return;
      const el = sentinelRef.current;
      if (!el) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => e.isIntersecting && onLoadMore());
      });
      io.observe(el);
      return () => io.disconnect();
    }, [hasNext, loading, onLoadMore]);

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 10px 24px rgba(0,0,0,.2)",
          zIndex: 3000,
          display: "flex",
          flexDirection: "column",
          height: heightPx,
          overflow: "hidden",
        }}
      >
        {/* ヘッダー */}
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
            {items.length} 件{loading ? "（読込中…）" : ""}
          </div>
          <button
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

        {/* リスト（ここだけスクロール可） */}
        <div style={{ flex: 1, overflowY: "auto", padding: 12, gap: 10, display: "grid" }}>
          {items.length === 0 && !loading && (
            <div style={{ color: "#666" }}>まだ保存がありません</div>
          )}

          {items.map((it) => (
            <PlaceDetailCard
              key={it.id}
              variant="inline"
              place={it.place}
              thumbnailUrl={it.thumbnail_url}
              isSaved={true}
              isSaving={false}
              // inline では onAdd は通常不要なので渡さない
              onRemove={() => onRemove?.(it.id)}
              onAddToPlan={() => onAddToPlan?.(it)}
              // クリックで地図パン
              onRootClick={() => onSelect(it)}
              thumbWidth={110}
              thumbHeight={90}
            />
          ))}

          {/* 無限読み足しの番人 */}
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

  return (
    <div style={{ height: (mapHeight ?? 400) + "px", width: "100%", position: "relative" }}>
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
          iconSrc={isSaved ? "/filledluggage.svg" : "/luggage.svg"}
          iconAlt="旅行プラン"
          onAction={() => alert("旅行プラン機能は準備中です")}
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
        <CustomMarker
          position={position}
          isFavorite={isSavedGlobally}
          onClick={() => {
            if (isSavedGlobally) {
              setShowDetail(true);
              setIsPopupOpen(false);
              onRequestExpand?.();
            } else {
              setIsPopupOpen(true);
              setShowDetail(false);
            }
          }}
        />

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
              message={"行きたい場所リストに追加しますか？"}
              confirmLabel={isSaving ? "保存中..." : "追加する"}
              cancelLabel="キャンセル"
              confirmDisabled={isSaving || !currentVideo?.id || !selectedPlace?.place_id}
              onConfirm={handleAddFavorite}
              onCancel={() => setIsPopupOpen(false)}
            />
          </div>
        )}
      </Map>

      {showDetail && isSavedGlobally && (
        <PlaceDetailCard
          variant="overlay"
          place={selectedPlace}
          thumbnailUrl={placeThumbUrl ?? currentVideo?.thumbnail ?? null}
          isSaved
          isSaving={isSaving}
          onAdd={undefined}
          onRemove={() => {
            if (currentWishlistId) {
              handleRemoveWishlist(currentWishlistId);
            } else {
              alert("削除対象のIDが取得できませんでした。")
            }
          }}
          onAddToPlan={() => alert("旅行プランに追加（仮）")}
          onClose={() => setShowDetail(false)}
          thumbWidth={120}
          thumbHeight={100}
        />
      )}

      {showWishlist && (
        <WishlistPanel
          heightPx={Math.min(520, Math.max(260, Math.floor((mapHeight ?? 400) * 0.65)))} // 画面に応じて可変
          items={wlItems}
          loading={wlLoading}
          hasNext={wlNext != null}
          onLoadMore={() => loadWishlist()}
          onClose={handleCloseWishlist}
          onSelect={handleSelectWishlistItem}
          onRemove={handleRemoveWishlist}
          onAddToPlan={handleAddToPlanFromWishlist}
        />
      )}
    </div>
  );
};

export default MapPreview;
