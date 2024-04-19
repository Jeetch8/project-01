import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CircleLoader } from 'react-spinners';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';

const GoogleLoginCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { doFetch: createAuthSession } = useFetch({
    url: base_url + '/auth/create-session',
    method: 'POST',
    authorized: true,
  });

  useEffect(() => {
    const access_token = searchParams.get('access_token');
    if (access_token) {
      localStorage.setItem('access_token', access_token);
      createAuthSession();
    }
    navigate('/');
  }, [searchParams]);

  return (
    <div className="flex justify-center items-center h-screen">
      <CircleLoader />
    </div>
  );
};

export default GoogleLoginCallback;
