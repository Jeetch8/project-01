import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { useEffect, useState } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import toast from 'react-hot-toast';
import TickGif from '@/assets/icons8-tick.gif';
import ErrorGif from '@/assets/icons8-cross.gif';

const VerifyingEmail = () => {
  const [querySearchParams] = useSearchParams();
  const [tokenError, setTokenError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { doFetch, fetchState } = useFetch({
    url: base_url + '/auth/verify-email',
    method: 'PATCH',
    onSuccess: () => {
      navigate('/');
    },
    onError: (res) => {
      if (typeof res.message === 'string') toast.error(res.message);
    },
  });

  useEffect(() => {
    const token = querySearchParams.get('token');
    if (!token) {
      setTokenError('Token not found');
      return;
    }
    if (token) {
      doFetch({ token });
      return;
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="border-2 border-slate-400 bg-white rounded-lg text-black px-10 py-7 text-center min-w-[350px] min-h-[150px]">
        {tokenError && (
          <>
            <h3 className="text-red-600 font-semibold text-xl">
              Error verifying email
            </h3>
            <p className="mt-3">{tokenError}</p>
            <p>Please check your link again.</p>
            <img
              src={ErrorGif}
              alt="error verifying email"
              width={80}
              className="mx-auto mt-4"
            />
          </>
        )}
        {fetchState === 'loading' && (
          <div>
            <h2 className="text-xl font-semibold">Verifying Email</h2>
            <div className="mt-4">
              <BeatLoader color="#1A8CD8" />
            </div>
          </div>
        )}
        {fetchState === 'error' && (
          <>
            <h3 className="text-red-600 font-semibold text-xl">
              Error verifying email
            </h3>
            <p className="mt-3">An Error occured while verifying your email</p>
            <img
              src={ErrorGif}
              alt="error verifying email"
              width={80}
              className="mx-auto mt-4"
            />
          </>
        )}
        {fetchState === 'success' && (
          <div>
            <p className="text-green-600 text-xl font-semibold">
              Email verified successfully
            </p>
            <img
              src={TickGif}
              alt="operation success"
              width={80}
              className="mx-auto mt-3"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyingEmail;
