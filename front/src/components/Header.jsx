import SearchBar from "./SearchBar";
import UserMenuOrLogout from "./UserMenuOrLogout";

function Header() {
  return (
    <header
      style={{
        backgroundColor: "#eee",
        padding: "1.5% 4%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "2%"
      }}>
      <h1>VloMaPlan</h1>
      <SearchBar />
      <UserMenuOrLogout />
    </header>
  )
}

export default Header;
