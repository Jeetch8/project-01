import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircleLoader } from 'react-spinners';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';

const GithubLoginCallback = () => {
  const { access_token } = useParams();
  const navigate = useNavigate();

  const { doFetch: createAuthSession } = useFetch({
    url: base_url + '/auth/create-session',
    method: 'POST',
    authorized: true,
  });

  useEffect(() => {
    if (access_token) {
      localStorage.setItem('access_token', access_token);
      createAuthSession();
    }
    navigate('/');
  }, [access_token]);

  return (
    <div className="flex justify-center items-center h-screen">
      <CircleLoader />
    </div>
  );
};

export default GithubLoginCallback;
