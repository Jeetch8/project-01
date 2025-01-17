import AvatarImage from '../AvatarImage';
import { IUser } from '@/utils/interfaces';

export default function UserCardWithFollow({ user }: { user: IUser }) {
  return (
    <div>
      <div className="flex justify-between py-3 cursor-pointer px-5">
        <div className="flex items-center">
          <AvatarImage url={user.profile_img} diameter="40px" />
          <div className="ml-3">
            <h3 className="font-bold text-[16px] hover:underline">
              {user.full_name}
            </h3>
            <p className="text-sm text-zinc-500 duration-200">
              @{user.username}
            </p>
          </div>
        </div>
        <div>
          <button className="bg-white text-black px-4 py-2 font-semibold rounded-full hover:bg-gray-100 transition-all duration-200">
            Follow
          </button>
        </div>
      </div>
    </div>
  );
}
