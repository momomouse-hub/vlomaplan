const VideoItem = ({video, channel, onClick}) => {
  return (
    <div>
      <img
        src={video.thumbnail}
        alt={video.title}
        style={{cursor: "pointer"}}
        onClick={onClick}
      />
      <p>{video.title}</p>
      <p>チャンネル名：{channel?.title || "不明"}</p>
    </div>
  )
}

export default VideoItem;