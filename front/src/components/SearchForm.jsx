import { useState } from "react";

const SearchForm = ({onSearch}) => {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()){
      const modifiedKeyword = `${keyword.trim()} Vlog`
      onSearch(modifiedKeyword);
    }
  }

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
  )
}

export default SearchForm;