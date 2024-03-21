import NavSidebar from '@/Components/Global/NavSidebar';
import { GlobalContextProvider } from '@/context/GlobalContext';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <GlobalContextProvider>
      <div className="flex mx-auto w-fit">
        <NavSidebar />
        <Outlet />
      </div>
    </GlobalContextProvider>
  );
};

export default MainLayout;
