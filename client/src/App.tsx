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
import ResetPassword from './pages/ResetPassword';
import MainLayout from './layout/MainLayout';
import VerifyingEmail from './pages/VerifyingEmail';

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
        ],
      },
      {
        path: '/bookmark',
        element: <Bookmark />,
      },
      // {
      //   path: "/profile",
      //   element: <Profile />,
      // },
      // {
      //   path: "/notifications",
      //   element: <Notifications />,
      // },
      // {
      //   path: "/messages",
      //   element: <Messages />,
      // },
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
    </div>
  );
};

export default App;
