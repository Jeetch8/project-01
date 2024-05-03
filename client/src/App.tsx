import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import HomeLayout from '@/layout/HomeLayout';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import PageNotFound from '@/pages/PageNotFound';
import Bookmark from '@/pages/Bookmark';
import Home from '@/pages/Home';
import ResetPassword from '@/pages/PasswordReset';
import MainLayout from './layout/MainLayout';
import VerifyingEmail from './pages/VerifyingEmail';
import { Toaster } from 'react-hot-toast';
import Profile from './pages/Profile';
import UserStatus from './pages/UserStatus';
import Explore from '@/pages/Explore';
import Messages from './pages/Messages';
import GoogleLogin from './pages/GoogleLoginCallback';
import GithubLogin from './pages/GithubLoginCallback';
import EmptyChatDisplay from './Components/Chat/EmptyChatDisplay';
import GroupChatDisplay from './Components/Chat/GroupChat';
import PrivateChatDisplay from './Components/Chat/PrivateChat';
import Communities from './pages/Communities';
import SingleCommunity from './pages/SingleCommunity';
import Settings from './pages/Settings';
import AccountInfo from './Components/Settings/Account/AccountInfo';
import ChangePassword from './Components/Settings/Account/ChangePassword';
import DeactivateAccount from './Components/Settings/Account/DeactivateAccount';
import Index from './Components/Settings/Account/Index';
import Sessions from './Components/Settings/Sessions';
import CommunityAdminSettings from './pages/CommunityAdminSettings';
import CommunityMembers from './Components/Community/CommunityMembers';
import EditCommunityInfo from './Components/Community/EditCommunityInfo';
import CommunityRules from './Components/Community/CommunityRules';
import CommunitiesSearch from './pages/CommunitiesSearch';

const router = createBrowserRouter([
  {
    path: '/google/login',
    element: <GoogleLogin />,
  },
  {
    path: '/github/login',
    element: <GithubLogin />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/verify-email',
    element: <VerifyingEmail />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'communities/:id/admin/settings',
        element: <CommunityAdminSettings />,
        children: [
          {
            path: 'members',
            element: <CommunityMembers />,
          },
          {
            path: 'edit_community_info',
            element: <EditCommunityInfo />,
          },
          {
            path: 'rules',
            element: <CommunityRules />,
          },
        ],
      },
      {
        path: 'messages',
        element: <Messages />,
        children: [
          {
            index: true,
            element: <EmptyChatDisplay />,
          },
          {
            path: 'group/:id',
            element: <GroupChatDisplay />,
          },
          {
            path: 'private/:id',
            element: <PrivateChatDisplay />,
          },
        ],
      },
      {
        path: 'settings',
        element: <Settings />,
        children: [
          {
            path: 'account',
            element: <Index />,
          },
          {
            path: 'account/account_info',
            element: <AccountInfo />,
          },
          {
            path: 'account/change_password',
            element: <ChangePassword />,
          },
          {
            path: 'account/deactivate_account',
            element: <DeactivateAccount />,
          },
          {
            path: 'sessions',
            element: <Sessions />,
          },
        ],
      },
      {
        path: '/',
        element: <HomeLayout />,
        children: [
          {
            path: 'home',
            element: <Home />,
          },
          {
            path: 'explore',
            element: <Explore />,
          },
          {
            path: 'bookmark',
            element: <Bookmark />,
          },
          {
            path: 'communities',
            element: <Communities />,
          },
          {
            path: 'communities/search',
            element: <CommunitiesSearch />,
          },
          {
            path: 'communities/:id',
            element: <SingleCommunity />,
          },

          {
            path: 'profile/:username',
            element: <Profile />,
          },
          {
            path: ':username/status/:postId',
            element: <UserStatus />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <PageNotFound />,
  },
]);

const App = () => {
  return (
    <div className="relative bg-black h-full w-full min-h-[100vh]">
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
};

export default App;
