import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { useState } from 'react';
import { MoonLoader } from 'react-spinners';
import { cn } from '@/utils/helpers';

const FollowBtn = ({
  defaultIsFollowing,
  userId,
  className,
}: {
  defaultIsFollowing: boolean;
  userId: string;
  className?: string;
}) => {
  const [isFollowing, setIsFollowing] = useState(defaultIsFollowing);
  const [isHovering, setIsHovering] = useState(false);

  const { doFetch: fetchFollowUser, fetchState: followState } = useFetch({
    url: base_url + '/user/follow',
    method: 'PATCH',
    authorized: true,
    onSuccess() {
      setIsFollowing(true);
    },
  });

  const { doFetch: fetchUnfollowUser, fetchState: unfollowState } = useFetch({
    url: base_url + '/user/unfollow',
    method: 'PATCH',
    authorized: true,
    onSuccess() {
      setIsFollowing(false);
    },
  });

  const handleClick = () => {
    if (isFollowing) {
      fetchUnfollowUser({ userId });
    } else {
      fetchFollowUser({ userId });
    }
  };

  const isLoading = followState === 'loading' || unfollowState === 'loading';

  return (
    <div>
      <button
        className={cn(
          `w-[115px] h-[40px] font-semibold rounded-full transition-all duration-200 border-2 
          ${
            isFollowing
              ? 'bg-transparent text-black hover:bg-red-50 border-gray-300'
              : 'bg-white text-black hover:bg-gray-100 border-white'
          }`,
          className
        )}
        disabled={isLoading}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isLoading ? (
          <MoonLoader size={14} />
        ) : isFollowing ? (
          isHovering ? (
            <span className="text-red-500">Unfollow</span>
          ) : (
            <span className="text-white">Following</span>
          )
        ) : (
          'Follow'
        )}
      </button>
    </div>
  );
};

export default FollowBtn;
