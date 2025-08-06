import { useState } from "react"
import { useNavigate } from "react-router-dom";

const SearchBar = ({ onSearch }) => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      const modifiedKeyword = `${keyword.trim()} Vlog`;
      navigate(`/search?q=${encodeURIComponent(modifiedKeyword)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="検索キーワードを入力"
      />
      <button type="submit">検索</button>
    </form>
  );
};

export default SearchBar;