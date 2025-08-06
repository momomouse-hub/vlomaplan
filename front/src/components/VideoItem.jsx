const VideoItem = ({video, channel}) => {
  return (
    <div>
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