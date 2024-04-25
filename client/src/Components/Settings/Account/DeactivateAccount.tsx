import AvatarImage from '@/Components/Global/AvatarImage';
import { useGlobalContext } from '@/context/GlobalContext';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const DeactivateAccount = () => {
  const navigate = useNavigate();
  const { user } = useGlobalContext();

  return (
    <div className="text-white">
      <div className="px-4 py-4 mb-3 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full transition-colors duration-200 hover:bg-gray-900"
        >
          <IoArrowBack size={18} />
        </button>
        <h1 className="text-xl font-semibold">Deactivate account</h1>
      </div>
      <div className="mx-5">
        <div className="flex items-start space-x-3">
          <AvatarImage url={user?.profile_img} diameter="40px" />
          <div className="hidden xl:inline-block">
            <p className="font-bold">{user?.full_name}</p>
            <p className="text-xs text-neutral-500">@{user?.username}</p>
          </div>
        </div>
        <h2 className="text-xl font-bold mt-7">
          This will deactivate your account
        </h2>
        <p className="text-sm text-neutral-500 mt-4">
          You’re about to start the process of deactivating your X account. Your
          display name, @username, and public profile will no longer be viewable
          on X.com, X for iOS, or X for Android.
        </p>
        <button className="text-white px-4 py-3 text-center w-full rounded-md mt-7 hover:bg-[rgba(248,57,57,0.1)] transition-colors duration-200">
          Deactivate
        </button>
      </div>
    </div>
  );
};

export default DeactivateAccount;
