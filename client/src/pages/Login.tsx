import { useFetch } from '../hooks/useFetch';
import { base_url } from '../utils/base_url';
import { setTokenInLocalStorage } from '@/utils/localstorage';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { useForm } from 'react-hook-form';
import { emailRegex, passwordRegex } from '@/utils/Regex';
import ErrorDisplayComp from '@/Components/Form/ErrorDisplayComp';
import PasswordInput from '@/Components/Form/PasswordInput';
import { FaGoogle } from 'react-icons/fa';
import { FaGithub } from 'react-icons/fa';
import RequestPasswordResetModal from '@/Components/Modals/RequestPasswordResetModal';
import { useState } from 'react';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [isGuestLogin, setIsGuestLogin] = useState(false);
  const navigate = useNavigate();
  const { fetchState, doFetch } = useFetch<{ access_token: string }>({
    url: base_url + '/auth/login/local',
    method: 'POST',
    authorized: false,
    onSuccess: (res) => {
      setTokenInLocalStorage(res.access_token);
      toast.success('Logged in');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    },
    onError: (err) => {
      if (typeof err.error === 'string') {
        toast.error(err.error);
      }
    },
  });

  const handleGuestLogin = async () => {
    setIsGuestLogin(true);
    await doFetch({
      email: 'demo@demo.com',
      password: 'PAssword!@12',
    });
    setIsGuestLogin(false);
  };

  return (
    <div className="flex justify-center items-center w-full h-[100vh] bg-black text-white">
      <div>
        <h2 className="font-semibold text-3xl text-center mb-3">Login</h2>
        <div className="border-2 px-10 w-fit py-10 rounded-md">
          <form
            onSubmit={handleSubmit(async (data) => {
              await doFetch(data);
            })}
          >
            <label className="font-semibold" htmlFor="email">
              Email
            </label>
            <br />
            <input
              {...register('email', {
                pattern: {
                  value: emailRegex,
                  message: 'Email is not valid',
                },
                required: {
                  value: true,
                  message: 'Email is required',
                },
              })}
              placeholder="Email"
              className="rounded-md outline-none text-black w-[300px] px-2 py-1 border-2 mt-1 mb-4"
              type="text"
            />
            <br />
            <ErrorDisplayComp error={errors.email} />
            <label className="font-semibold" htmlFor="password">
              Password
            </label>
            <div className="max-w-[300px] w-full mt-1">
              <PasswordInput
                errors={errors.password}
                fieldName="password"
                inputClassName="h-[38px]"
                register={register}
                fieldRules={{
                  required: {
                    value: true,
                    message: 'Password is required',
                  },
                  pattern: {
                    value: passwordRegex,
                    message:
                      'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one symbol',
                  },
                }}
                placeholder="Password"
              />
            </div>
            <button
              className="px-6 py-3 rounded-md w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 mt-6 mb-2"
              type="submit"
              disabled={fetchState === 'loading'}
            >
              {fetchState === 'loading' && !isGuestLogin ? (
                <ScaleLoader role="loader" height={13} />
              ) : (
                'Submit'
              )}
            </button>
          </form>
          <button
            className="px-6 py-3 rounded-md w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 mt-1 mb-6"
            type="button"
            onClick={handleGuestLogin}
            disabled={fetchState === 'loading' && isGuestLogin}
          >
            {fetchState === 'loading' && isGuestLogin ? (
              <ScaleLoader role="loader" height={13} />
            ) : (
              'Guest Login'
            )}
          </button>
          <RequestPasswordResetModal />
          <Link
            to={'/register'}
            className="text-blue-500 underline block text-center"
          >
            Register
          </Link>
          <div>
            <a
              href={base_url + '/auth/login/google'}
              role="button"
              type="button"
              className="bg-white w-full py-2 rounded-sm flex gap-x-4 items-center justify-center mt-4"
            >
              <FaGoogle color="black" />
              <span className="text-black">Google Sign in</span>
            </a>
            <a
              href={base_url + '/auth/login/github'}
              role="button"
              type="button"
              className="bg-white w-full py-2 rounded-sm flex gap-x-4 items-center justify-center mt-2"
            >
              <FaGithub color="black" />
              <span className="text-black">Github Sign in</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
