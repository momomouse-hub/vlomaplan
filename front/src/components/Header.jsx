import SearchBar from "./SearchBar";
import UserMenuOrLogout from "./UserMenuOrLogout";

function Header() {
  return (
    <header
      style={{
        height: "var(--header-h)",
        padding: "0 4%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "2%",
        backgroundColor: "#eee",
        boxSizing: "border-box",
        borderBottom: "1px solid #ddd",
      }}
    >
      <h1 style={{ margin: 0 }}>VloMaPlan</h1>
      <SearchBar />
      <UserMenuOrLogout />
    </header>
  );
}

export default Header;
