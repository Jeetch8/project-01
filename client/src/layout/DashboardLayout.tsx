import RightSidebar from "@/Components/Global/RightSidebar";
import React from "react";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <>
      <Outlet />
      <RightSidebar />
    </>
  );
};

export default DashboardLayout;
