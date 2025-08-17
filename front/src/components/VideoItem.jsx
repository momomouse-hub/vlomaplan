function VideoItem({ video, channel, onClick }) {
  if (!video) return null;

  const title = video.title ?? "動画";
  const channelName = channel?.title ?? "不明";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`動画を開く: ${title}`}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      <img
        src={video.thumbnail}
        alt={title}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
      <p style={{ margin: "8px 0 4px" }}>{title}</p>
      <p style={{ margin: 0 }}>チャンネル名：{channelName}</p>
    </button>
  );
}

export default VideoItem;
