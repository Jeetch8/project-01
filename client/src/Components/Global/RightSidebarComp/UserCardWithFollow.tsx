import AvatarImage from '../AvatarImage';
import { IUser } from '@/types/interfaces';
import FollowBtn from '../FollowBtn';

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
          <FollowBtn
            userId={user.id}
            defaultIsFollowing={false}
            className={
              'h-[30px] w-[80px] hover:bg-gray-300 hover:border-gray-300 text-[14px]'
            }
          />
        </div>
      </div>
    </div>
  );
}
