import { Outlet } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import Header from "../Header";

function MainLayout() {
  return (
      <>
        <Header />
        <ScrollToTop />
        <Outlet />
      </>
  );
}

export default MainLayout;