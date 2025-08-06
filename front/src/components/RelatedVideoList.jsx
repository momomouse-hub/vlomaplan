import VideoItem from "./VideoItem";

const RelatedVideoList = ({ videos, channels, onClick }) => {
  return (
    <>
      <h3>関連動画</h3>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {videos.map((video) => (
          <VideoItem
            key={video.id}
            video={video}
            channel={channels.find((c) => c.id === video.channelId)}
            onClick={() => onClick(video.id)}
          />
        ))}
      </div>
    </>
  );
};

export default RelatedVideoList;
