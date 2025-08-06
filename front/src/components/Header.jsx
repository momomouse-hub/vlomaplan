import SearchBar from "./SearchBar";

const Header = () => {
  return (
    <header style={{ backgroundColor: "#eee", padding: "10px" }}>
      <h1>VloMaPlan</h1>
      <SearchBar />
    </header>
  )
}

export default Header;