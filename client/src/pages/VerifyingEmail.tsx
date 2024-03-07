import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { useEffect } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import toast from 'react-hot-toast';

const VerifyingEmail = () => {
  const [querySearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { doFetch, fetchState } = useFetch({
    url: base_url + '/auth/verify-email',
    method: 'POST',
    onSuccess: () => {
      navigate('/');
    },
    onError: (res) => {
      if (typeof res.message === 'string') toast.error(res.message);
    },
  });
  const token = querySearchParams.get('token');

  useEffect(() => {
    if (token) doFetch({ token });
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="border-2 border-white rounded-lg text-white px-10 py-7 text-center">
        {fetchState === 'loading' && (
          <div>
            <h2 className="text-xl">Verifying Email</h2>
            <BeatLoader />
          </div>
        )}
        {fetchState === 'error' && (
          <>
            <h3 className="text-red-600 font-semibold text-xl">
              Error verifying email
            </h3>
            <p className="mt-3">An Error occured while verifying you email</p>
          </>
        )}
        {fetchState === 'success' && (
          <p className="text-green-600">Email verified successfully</p>
        )}
      </div>
    </div>
  );
};

export default VerifyingEmail;
