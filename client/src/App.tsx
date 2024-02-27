import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomeLayout from "@/layout/HomeLayout";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import PageNotFound from "@/pages/PageNotFound";
import Bookmark from "@/pages/Bookmark";
// import Profile from "@/pages/Profile";
// import Notifications from "@/pages/Notifications";
// import Messages from "@/pages/Messages";
import Home from "@/pages/Home";
import ResetPassword from "./pages/ResetPassword";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/bookmark",
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
      {
        path: "/*",
        element: <PageNotFound />,
      },
    ],
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
]);

const App = () => {
  return (
    <div className=" relative">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
