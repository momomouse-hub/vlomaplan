import { useEffect } from "react";
import fetchYoutubeVideos from "../utils/fetchYoutube";

const TestFetch = () => {
  useEffect(() => {
    const run = async () => {
      const data = await fetchYoutubeVideos("京都 Vlog");
      console.log(data);
    };

    run();
  }, []);

  return (
    <div>
      <h1>YouTube API Test</h1>
      <p>ブラウザのコンソールで確認</p>
    </div>
  )
};

export default TestFetch;