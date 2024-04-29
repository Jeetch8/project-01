import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import AdminNavigation from '@/Components/Community/AdminNavigation';
import { useEffect } from 'react';

const CommunityAdminSettings = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.endsWith('settings/')) {
      navigate('edit_community_info');
    } else if (pathname.endsWith('settings')) {
      navigate('/edit_community_info');
    }
  }, []);

  return (
    <div className="flex text-white">
      <div className="w-[400px] border-r border-zinc-800">
        <div className="px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full transition-colors duration-200 hover:bg-gray-900"
          >
            <IoArrowBack size={18} />
          </button>
          <h1 className="text-xl font-semibold">Admin tools</h1>
        </div>
        <AdminNavigation />
      </div>
      <div className="w-[620px] p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default CommunityAdminSettings;
