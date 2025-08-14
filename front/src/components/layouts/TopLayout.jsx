import TopHeader from "../TopHeader";
import ScrollToTop from "../ScrollToTop";
import { Outlet } from "react-router-dom";

const TopLayout = () => {
  return (
      <>
        <TopHeader></TopHeader>
        <ScrollToTop />
        <Outlet />
      </>
  );
};

export default TopLayout;