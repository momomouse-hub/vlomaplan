import ReactPlayer from "react-player";

const VideoPlayerWrapper = ({ videoId }) => {
  return (
    <div style={{ position: "relative", paddingTop: "56.25%", width: "100%" }}>
      <ReactPlayer
        src={`https://www.youtube.com/watch?v=${videoId}`}
        controls
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
};

export default VideoPlayerWrapper;