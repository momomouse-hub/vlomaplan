import ScrollToTop from "../ScrollToTop";
import Header from "../Header";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
      <>
        <Header />
        <ScrollToTop />
        <Outlet />
      </>
  );
};

export default MainLayout;