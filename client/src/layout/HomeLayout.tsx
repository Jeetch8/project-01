import React from "react";
import NavSidebar from "@/components/NavSidebar";
import { Outlet } from "react-router-dom";

const HomeLayout = () => {
  return (
    <div>
      <NavSidebar />
      <Outlet />
    </div>
  );
};

export default HomeLayout;
