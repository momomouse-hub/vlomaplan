import UserMenuOrLogout from "./UserMenuOrLogout";

function TopHeader() {
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
      <UserMenuOrLogout />
    </header>
  )
}

export default TopHeader;
