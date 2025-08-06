const VideoItem = ({video, channel, onClick}) => {
  return (
      <div style={{ cursor: "pointer"}} onClick={onClick}>
          <img
            src={video.thumbnail}
            alt={video.title}
          />
          <p>{video.title}</p>
          <p>チャンネル名：{channel?.title || "不明"}</p>
      </div>
  )
}

export default VideoItem;