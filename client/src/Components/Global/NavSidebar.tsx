import { GoHome, GoHomeFill } from 'react-icons/go';
import {
  IoNotificationsOutline,
  IoNotificationsSharp,
  IoSearchOutline,
  IoSearchSharp,
  IoBookmarkOutline,
  IoBookmark,
  IoSettingsOutline,
  IoSettingsSharp,
} from 'react-icons/io5';
import { TbMailFilled, TbMail } from 'react-icons/tb';
import { PiUsersFill, PiUsers, PiUser, PiUserFill } from 'react-icons/pi';
import { useLocation, useNavigate } from 'react-router-dom';
import AvatarImage from '@/Components/Global/AvatarImage';
import { IoIosMore } from 'react-icons/io';
import { Button } from '@/Components/Global/Button';
import { FiFeather } from 'react-icons/fi';
import { useGlobalContext } from '@/context/GlobalContext';
import { NavLink } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

const navigationLinks = [
  {
    name: 'Home',
    iconOnStale: GoHome,
    iconOnSelection: GoHomeFill,
    toInclude: 'home',
    path: '/home',
  },
  {
    name: 'Explore',
    iconOnStale: IoSearchOutline,
    iconOnSelection: IoSearchSharp,
    toInclude: 'explore',
    path: '/explore',
  },
  {
    name: 'Notifications',
    iconOnStale: IoNotificationsOutline,
    iconOnSelection: IoNotificationsSharp,
    toInclude: 'notifications',
    path: '/notifications',
  },
  {
    name: 'Messages',
    iconOnStale: TbMail,
    iconOnSelection: TbMailFilled,
    toInclude: 'messages',
    path: '/messages',
  },
  {
    name: 'Bookmarks',
    iconOnStale: IoBookmarkOutline,
    iconOnSelection: IoBookmark,
    toInclude: 'bookmarks',
    path: '/bookmark',
  },
  {
    name: 'Profile',
    iconOnStale: PiUser,
    iconOnSelection: PiUserFill,
    path: '/profile/me',
    toInclude: 'profile',
  },
  {
    name: 'Communities',
    iconOnStale: PiUsers,
    iconOnSelection: PiUsersFill,
    path: '/communities',
    toInclude: 'communities',
  },
  {
    name: 'Settings',
    iconOnStale: IoSettingsOutline,
    iconOnSelection: IoSettingsSharp,
    path: '/settings',
    toInclude: 'settings',
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const { user } = useGlobalContext();

  return (
    <nav className="border-r-[2px] flex justify-between flex-col h-screen border-zinc-900 bg-black text-white pl-6 max-w-[280px] w-fit sticky top-0">
      <div className="pr-4">
        {navigationLinks.map((link) => (
          <>
            <NavLink
              key={link.name}
              to={link.path}
              data-tooltip-id={`navlink-${link.name}`}
              data-tooltip-content={link.name}
              className={({ isActive }) =>
                `flex items-center rounded-full hover:bg-zinc-800 text-[18px] delay-100 duration-150 w-fit px-3 py-3 my-2 ${
                  isActive ? 'font-bold' : ''
                }`
              }
            >
              {pathname.includes(link.toInclude) ? (
                <link.iconOnSelection className="w-7 h-7" />
              ) : (
                <link.iconOnStale className="w-7 h-7" />
              )}
              <span className="ml-4 hidden xl:inline-block">{link.name}</span>
            </NavLink>
            <Tooltip id={`navlink-${link.name}`} />
          </>
        ))}
        <div className="xl:mr-6">
          <Button
            className="bg-[#199BF0] hover:bg-[#1A8CD8] xl:w-[210px] xl:h-12 w-fit rounded-full text-[18px] h-14 hover:shadow-lg cursor-pointer"
            variant="link"
            onClick={() => navigate('/')}
          >
            <span>
              <FiFeather className="w-7 h-7 xl:hidden xl:mr-4" />
              <span className="hidden xl:inline-block">Post</span>
            </span>
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center mx-2 mb-2 py-2  px-2 hover:bg-zinc-900 rounded-full cursor-pointer">
        <div className="flex items-center space-x-2">
          <AvatarImage url={user?.profile_img} diameter="40px" />
          <div className="hidden xl:inline-block">
            <p className="font-bold">{user?.full_name}</p>
            <p className="text-xs text-slate-500">@{user?.username}</p>
          </div>
        </div>
        <button className="hidden xl:inline-block">
          <IoIosMore className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
