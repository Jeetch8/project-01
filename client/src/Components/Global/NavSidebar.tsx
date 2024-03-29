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
import { RiFileList2Line, RiFileListFill } from 'react-icons/ri';
import { PiUsersFill, PiUsers, PiUser, PiUserFill } from 'react-icons/pi';
import { Link, useLocation } from 'react-router-dom';
import AvatarImage from '@/Components/Global/AvatarImage';
import { IoIosMore } from 'react-icons/io';
import { Button } from '@/Components/Global/Button';
import { FiFeather } from 'react-icons/fi';
import { useGlobalContext } from '@/context/GlobalContext';

const navigationLinks = [
  {
    name: 'Home',
    iconOnStale: GoHome,
    iconOnSelection: GoHomeFill,
    path: '/',
  },
  {
    name: 'Explore',
    iconOnStale: IoSearchOutline,
    iconOnSelection: IoSearchSharp,
    path: '/explore',
  },
  {
    name: 'Notifications',
    iconOnStale: IoNotificationsOutline,
    iconOnSelection: IoNotificationsSharp,
    path: '/notifications',
  },
  {
    name: 'Messages',
    iconOnStale: TbMail,
    iconOnSelection: TbMailFilled,
    path: '/message',
  },
  {
    name: 'Bookmarks',
    iconOnStale: IoBookmarkOutline,
    iconOnSelection: IoBookmark,
    path: '/bookmark',
  },
  {
    name: 'Lists',
    iconOnStale: RiFileList2Line,
    iconOnSelection: RiFileListFill,
    path: '/list',
  },
  {
    name: 'Profile',
    iconOnStale: PiUser,
    iconOnSelection: PiUserFill,
    path: '/profile',
  },
  {
    name: 'Communities',
    iconOnStale: PiUsers,
    iconOnSelection: PiUsersFill,
    path: '/communities',
  },
  {
    name: 'Settings',
    iconOnStale: IoSettingsOutline,
    iconOnSelection: IoSettingsSharp,
    path: '/settings',
  },
];

export default function Sidebar() {
  const pathname = useLocation().pathname;
  const { user } = useGlobalContext();

  return (
    <nav className="border-r-[2px] flex justify-between flex-col h-screen border-zinc-900 bg-black text-white pl-6 max-w-[280px] w-fit sticky top-0">
      <div className="pr-4">
        {navigationLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center rounded-full hover:bg-zinc-800 text-2xl delay-100 duration-150 w-fit px-3 py-3 my-2 ${
              pathname === link.path && 'font-bold'
            }`}
          >
            {pathname === link.path ? (
              <link.iconOnSelection className="w-7 h-7" />
            ) : (
              <link.iconOnStale className="w-7 h-7" />
            )}
            <span className="ml-4 hidden xl:inline-block">{link.name}</span>
          </Link>
        ))}
        <Button className="bg-[#199BF0] xl:w-full w-fit rounded-full text-xl h-14 hover:bg-[#1A8CD8] hover:shadow-lg cursor-pointer">
          <span>
            <FiFeather className="w-7 h-7 xl:hidden xl:mr-4" />
            <span className="hidden xl:inline-block">Post</span>
          </span>
        </Button>
      </div>
      <div className="flex justify-between items-center mx-2 mb-2 py-2  px-2 hover:bg-zinc-900 rounded-full cursor-pointer">
        <div className="flex items-center space-x-2">
          <AvatarImage url={user?.profile_img} diameter="40px" />
          <div className="hidden xl:inline-block">
            <p className="font-bold">Jeet Chawda</p>
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
