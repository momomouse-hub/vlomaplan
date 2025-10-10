import { Outlet } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import Header from "../Header";

function MainLayout() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        minWidth: 0,
      }}
    >
      <Header />
      <div style={{ minHeight: 0 }}>
        <ScrollToTop />
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
