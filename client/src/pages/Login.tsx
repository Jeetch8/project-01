import React, { useEffect, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { base_url } from "../utils/base_url";
import {
  setTokenInLocalStorage,
  getTokenFromLocalStorage,
} from "../utils/localstorage";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEyeOff, FiEye } from "react-icons/fi";

const emailReg = new RegExp(
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
);
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailValidateErr, setEmailValidateErr] = useState(null);
  const navigate = useNavigate();
  const {
    fetchState,
    doFetch,
    dataRef: fetchData,
    errorRef: fetchError,
  } = useFetch({
    url: base_url + "/auth/login",
    method: "POST",
    authorized: false,
    onSuccess: (res) => {
      setTokenInLocalStorage(res.token);
      toast.success("Logged in");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
    onError: (err) => {
      console.log(err.message);
      if (err.message === "Email not found") {
        toast.error("Incorrect email");
        return;
      }
      if (err.message === "Password Incorrect") {
        toast.error("Password Incorrect");
        return;
      }
    },
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const token = getTokenFromLocalStorage();
    if (token) {
      navigate("/home");
    }
  }, []);

  const handleInputChange = (e) => {
    const targetName = e.target.name;
    const targetValue = e.target.value;
    if (targetName === "email") {
      if (!emailReg.test(targetValue)) {
        setEmailValidateErr("Invalid email");
      } else {
        setEmailValidateErr(null);
      }
    }
    setFormData((prev) => {
      return { ...prev, [targetName]: targetValue };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await doFetch(formData);
  };

  return (
    <div className="flex justify-center items-center w-full h-[100vh] bg-black text-white">
      <div>
        <h2 className="font-semibold text-3xl text-center mb-3">Login</h2>
        <div className="border-2 px-10 w-fit py-10 rounded-md">
          <form action="">
            <label className="font-semibold" htmlFor="email">
              Email
            </label>
            <br />
            <input
              onChange={handleInputChange}
              className="rounded-md outline-none text-black px-2 py-1 border-2 mt-1 w-full"
              type="text"
              name="email"
              id="email"
            />
            <br />
            {emailValidateErr && (
              <p className="text-red-500 text-sm">{emailValidateErr}</p>
            )}
            <label className="font-semibold" htmlFor="password">
              Password
            </label>
            <br />
            <div className="bg-white flex items-center h-fit w-fit rounded-md">
              <input
                onChange={handleInputChange}
                className="rounded-md outline-none text-black px-2 py-1 mt-1"
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
              />
              <button
                type="button"
                className="mx-2 h-fit"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FiEyeOff color="black" />
                ) : (
                  <FiEye color="black" />
                )}
              </button>
            </div>
            <br />
            <button
              className="px-6 py-3 rounded-md w-full bg-blue-500 hover:bg-blue-600 mb-2"
              type="submit"
              disabled={fetchState === "loading" || emailValidateErr}
              onClick={handleFormSubmit}
            >
              Submit
            </button>
          </form>
          <Link
            to={"/forgot-password"}
            className="text-blue-500 underline block text-center"
          >
            Forgot password ?
          </Link>
          <Link
            to={"/register"}
            className="text-blue-500 underline block text-center"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
