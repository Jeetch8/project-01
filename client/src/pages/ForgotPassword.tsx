import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { base_url } from "../utils/base_url";
import { useNavigate } from "react-router-dom";
import { getTokenFromLocalStorage } from "@/utils/LocalStorage";
import { useForm } from "react-hook-form";
import { useFetch } from "@/hooks/useFetch";

const ForgotPassword = () => {
  const [emailValidateErr, setEmailValidateErr] = useState(null);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTokenReceived, setIsTokenReceived] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const token = getTokenFromLocalStorage();
    if (token) {
      navigate("/home");
    }
  }, []);

  const { doFetch: fetchResetToken } = useFetch<{
    resetToken: string;
    message: string;
  }>({
    url: `${base_url}/auth/reset-password`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    onSuccess: (data) => {
      if (data.resetToken) {
        setResetToken(data.resetToken);
        toast.success("Please set your new password.");
        setIsTokenReceived(true);
      } else {
        toast.error(data.message);
      }
    },
    onError: () => {
      toast.error("An error occurred. Please try again later.");
    },
  });

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      // Request backend for reset token
      const response = await axios.post(`${base_url}/auth/reset-password`, {
        email: email,
      });

      // If reset token is received, show inputs for new password and confirm password
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
        toast.success("Please set your new password.");
        setIsTokenReceived(true);
        // TODO: Show inputs for new password and confirm password
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      // Request backend for password change
      const response = await axios.post(
        `${base_url}/auth/change-password`,
        {
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${resetToken}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Password changed successfully.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
  };

  const handleEmailValueChnage = (e) => {
    const targetValue = e.target.value;
    if (!emailReg.test(targetValue)) {
      setEmailValidateErr("Invalid email");
    } else {
      setEmailValidateErr(null);
    }
    setEmail(e.target.value);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black text-white">
      <div className="py-8 px-6 border-2 rounded-md">
        {isTokenReceived ? (
          <div>
            <h2 className="font-semibold text-3xl">Enter new password</h2>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="text-black outline-none py-2 px-2 border rounded block mx-auto mt-4 w-full"
              placeholder="New Password"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-black outline-none py-2 px-2 border rounded block mx-auto mt-4 w-full"
              placeholder="Confirm Password"
            />
            <button
              onClick={handleChangePassword}
              className="py-2 px-4 bg-blue-500 text-white rounded mt-4 mx-auto block"
            >
              Reset Password
            </button>
          </div>
        ) : (
          <div>
            <div>
              <h2 className="text-2xl font-semibold text-center">
                Forgot Password
              </h2>
              <p>Please enter the email that you used to register an account</p>
            </div>
            <input
              type="email"
              value={email}
              onChange={handleEmailValueChnage}
              className="text-black outline-none py-2 px-2 border rounded block mx-auto mt-4 w-full"
              placeholder="Email"
            />
            <button
              onClick={handleResetPassword}
              className="py-2 px-4 bg-blue-500 text-white rounded mt-4 mx-auto block"
            >
              Request Reset Token
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;
