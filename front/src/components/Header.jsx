import SearchBar from "./SearchBar";

function Header() {
  return (
    <header
      style={{
        backgroundColor: "#eee",
        padding: "10px",
        display: "flex",
        justifyContent: "space-between"
      }}>
      <h1>VloMaPlan</h1>
      <SearchBar />
      <h1>Menu</h1>
    </header>
  )
}

export default Header;