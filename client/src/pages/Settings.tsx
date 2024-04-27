import { HiChevronRight } from 'react-icons/hi';
import { NavLink, Outlet } from 'react-router-dom';

const settingsOptions = [
  { id: 'account', label: 'Your account', navigateTo: '/settings/account' },
  { id: 'security', label: 'Account access', navigateTo: '/settings/sessions' },
];

const Settings = () => {
  return (
    <div className="text-white flex">
      <div className="border-r-[1px] border-zinc-900 bg-black w-[420px] text-white">
        <div className="flex justify-between py-3 px-5 bg-[rgba(0,0,0,0.9)] backdrop-blur-xl sticky top-0 z-50">
          <h2 className="font-bold text-[20px]">Settings</h2>
        </div>
        <div className="mt-4">
          {settingsOptions.map((option) => (
            <NavLink
              key={option.id}
              to={option.navigateTo}
              className={({ isActive }) =>
                `px-4 py-3 cursor-pointer block w-full hover:bg-zinc-800 transition-colors duration-200 border-r-2 ${isActive ? 'bg-zinc-800 border-blue-500' : 'border-transparent'}`
              }
            >
              <span className="flex items-center justify-between w-full">
                {option.label}
                <span className="text-gray-400">
                  <HiChevronRight size={20} />
                </span>
              </span>
            </NavLink>
          ))}
        </div>
      </div>
      <div className="border-r-[2px] border-zinc-900 bg-black w-[620px] text-white">
        <Outlet />
      </div>
    </div>
  );
};

export default Settings;
