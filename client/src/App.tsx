import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import HomeLayout from '@/layout/HomeLayout';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import PageNotFound from '@/pages/PageNotFound';
import Bookmark from '@/pages/Bookmark';
// import Profile from "@/pages/Profile";
// import Notifications from "@/pages/Notifications";
// import Messages from "@/pages/Messages";
import Home from '@/pages/Home';
import ResetPassword from '@/pages/PasswordReset';
import MainLayout from './layout/MainLayout';
import VerifyingEmail from './pages/VerifyingEmail';
import { Toast, Toaster } from 'react-hot-toast';
import Profile from './pages/Profile';
import UserStatus from './pages/UserStatus';
import Explore from '@/pages/Explore';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomeLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: '/explore',
            element: <Explore />,
          },
          {
            path: '/bookmark',
            element: <Bookmark />,
          },
          {
            path: '/:username',
            element: <Profile />,
          },
          {
            path: '/:username/status/:postId',
            element: <UserStatus />,
          },
        ],
      },
    ],
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
