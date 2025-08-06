import { useState } from "react";
import fetchYoutubeVideos from "../utils/fetchYoutube";
import SearchForm from "./SearchForm";

const SearchApp = () => {
  const [videos, setVideos] = useState([]);

  const handleSearch = async (keyword) => {
    const data = await fetchYoutubeVideos(keyword);
    setVideos(data.items);
    console.log(data);
  };

  return (
    <div>
      <h2>YouTube動画検索</h2>
      <SearchForm onSearch={handleSearch}/>
      <p>ブラウザのコンソールで結果を確認</p>
    </div>
  );
}

export default SearchApp;