import { Outlet } from "react-router-dom";
import TopHeader from "../TopHeader";
import ScrollToTop from "../ScrollToTop";

function TopLayout() {
  return (
      <>
        <TopHeader />
        <ScrollToTop />
        <Outlet />
      </>
  );
}

export default TopLayout;