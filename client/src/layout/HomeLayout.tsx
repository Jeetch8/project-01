import RightSidebar from "@/Components/Global/RightSidebar";
import { Outlet } from "react-router-dom";

const HomeLayout = () => {
  return (
    <>
    <Outlet />
      <RightSidebar />
    </>
  );
};

export default HomeLayout;
