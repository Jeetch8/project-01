import { IUser } from '@/types/interfaces';
import AvatarImage from '../Global/AvatarImage';
import { useNavigate } from 'react-router-dom';

export default function UserCardWithFollow({ user }: { user: IUser }) {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/profile/${user.username}`)}>
      <div className="flex justify-between cursor-pointer px-1">
        <div className="flex items-start">
          <AvatarImage url={user.profile_img} diameter="40px" />
          <div className="ml-3">
            <h3 className="font-bold text-[16px] hover:underline">
              {user.full_name}
            </h3>
            <p className="text-md text-zinc-500 duration-200">
              @{user.username}
            </p>
            <p>{user.bio}</p>
          </div>
        </div>
        <div>
          <button className="bg-white text-black px-4 py-1 font-semibold rounded-full hover:bg-gray-100 transition-all duration-200">
            Follow
          </button>
        </div>
      </div>
    </div>
  );
}
