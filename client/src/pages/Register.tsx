import React, { useEffect, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { base_url } from "../utils/base_url";
import {
  getTokenFromLocalStorage,
  setTokenInLocalStorage,
} from "../utils/localstorage";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const emailReg = new RegExp(
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
);
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailValidateErr, setEmailValidateErr] = useState(null);
  const navigate = useNavigate();
  const {
    fetchState,
    dataRef: fetchData,
    errorRef: fetchError,
    doFetch,
  } = useFetch({
    url: base_url + "/auth/register",
    method: "POST",
    authorized: false,
    onSuccess: (res) => {
      setTokenInLocalStorage(res.token);
      toast.success("Registeration success");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
    onError: (err) => {
      if (err.message === "Email already exists")
        toast.error("Email already exist", { duration: 5000 });
      else toast.error("Somethign went wrong", { duration: 5000 });
    },
  });
  const [formData, setFormData] = useState({
    name: "",
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
        <h2 className="font-semibold text-3xl text-center mb-3">Register</h2>
        <div className="border-2 px-10 w-fit py-10 rounded-md">
          <form action="">
            <label className="font-semibold" htmlFor="name">
              Full Name
            </label>
            <br />
            <input
              onChange={handleInputChange}
              className="rounded-md outline-none text-black px-2 py-1 border-2 mt-1 mb-4 w-full"
              type="text"
              name="name"
              id="name"
            />
            <br />
            <label className="font-semibold" htmlFor="email">
              Email
            </label>
            <br />
            <input
              onChange={handleInputChange}
              className="rounded-md outline-none text-black px-2 py-1 border-2 mt-1 mb-4 w-full"
              type="text"
              name="email"
              id="email"
            />
            <br />
            <label className="font-semibold mt-4" htmlFor="password">
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
            <label className="font-semibold mt-4" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <br />
            <div className="bg-white flex items-center h-fit w-fit rounded-md">
              <input
                onChange={handleInputChange}
                className="rounded-md outline-none text-black px-2 py-1 mt-1"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
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
              className="px-6 py-3 rounded-md w-full bg-blue-500 hover:bg-blue-600"
              type="submit"
              onClick={handleFormSubmit}
              disabled={fetchState === "loading" || emailValidateErr}
            >
              Submit
            </button>
          </form>
          <Link
            to={"/login"}
            className="text-blue-500 underline block mt-4 text-center"
          >
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
