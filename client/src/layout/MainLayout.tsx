import NavSidebar from '@/Components/Global/NavSidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex mx-auto w-fit">
      <NavSidebar />
      <Outlet />
    </div>
  );
};

export default MainLayout;
