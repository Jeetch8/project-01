import NavSidebar from '@/Components/Global/NavSidebar';
import { GlobalContextProvider } from '@/context/GlobalContext';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const MainLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname === '/') {
      navigate('/home');
    }
  }, [pathname]);

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
