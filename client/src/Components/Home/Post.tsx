import React from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarImage from '@/Components/Global/AvatarImage';
import { TbHeartFilled, TbMessage } from 'react-icons/tb';
import { CiHeart } from 'react-icons/ci';
import { CiBookmark } from 'react-icons/ci';
import PostImages from './PostImages';
import { FaBookmark } from 'react-icons/fa';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { IFeedPost } from '@/types/interfaces';
import CommentPostModal from '@/Components/Modals/CommentPostModal';
import { twMerge } from 'tailwind-merge';
import { PiUsersFill } from 'react-icons/pi';
import PostDropdown from '@/Components/DropDowns/PostDropdown';

interface Props {
  post: IFeedPost;
  outerClassName?: string;
}

const Post = ({ post, outerClassName }: Props) => {
  const navigate = useNavigate();
  const [isCommentModalOpen, setIsCommentModalOpen] =
    React.useState<boolean>(false);

  const { doFetch: toggleLikeFetch } = useFetch({
    url: base_url + `/post/${post.id}/togglelike`,
    authorized: true,
    method: 'PATCH',
    onSuccess: (res: { post: IFeedPost }) => {
      post.liked = res.post.liked;
      post.likes_count = res.post.likes_count;
    },
  });

  const { doFetch: toggleBookmarkFetch } = useFetch({
    url: base_url + `/post/${post.id}/togglebookmark`,
    authorized: true,
    method: 'PATCH',
    onSuccess: (res: { post: IFeedPost }) => {
      post.bookmarked = res.post.bookmarked;
    },
  });

  return (
    <div
      className={twMerge(
        'border-b-[2px] border-zinc-900 px-4 pt-3 pb-3 text-white',
        outerClassName
      )}
    >
      {post.isCommunityPost && (
        <div className="flex items-center gap-x-2 text-sm ml-12 font-semibold text-gray-500">
          <PiUsersFill color="gray" size={20} /> {post.communityName}
        </div>
      )}
      <div className="flex gap-x-2 items-start w-full">
        <div>
          <AvatarImage url={post?.creator?.profile_img} diameter={'42px'} />
        </div>
        <div className="w-full pr-2">
          <div className="flex justify-between">
            <div>
              <span
                className="font-bold mr-1 hover:underline cursor-pointer"
                onClick={() => navigate(`/profile/${post.creator.username}`)}
              >
                {post?.creator?.full_name}
              </span>
              <span
                className="font-light text-gray-400 ml-1"
                onClick={() => navigate(`/profile/${post.creator.username}`)}
              >
                @{post?.creator?.username}
              </span>
              {post.isCommunityPost && post.roleInCommunity && (
                <>
                  <span> · </span>
                  <span className="text-sm ml-1 bg-[#199BF0] text-white px-2 rounded-[10%]">
                    {post.roleInCommunity}
                  </span>
                </>
              )}
              <span> · </span>
              <span className="text-sm text-gray-500 ml-1">
                {post?.timeAgo}
              </span>
            </div>
            <PostDropdown
              post={post}
              isAdmin={post.roleInCommunity === 'ADMIN'}
            />
          </div>
          <p
            className="cursor-pointer"
            onClick={() => {
              navigate(`/${post?.creator?.username}/status/${post.id}`);
            }}
          >
            {post.caption}
          </p>
          {post?.media?.length > 0 && (
            <div className="rounded-xl overflow-hidden mt-2 mb-[-15px]">
              <PostImages media={post.media} />
            </div>
          )}
          <div className="mt-1 flex justify-between mr-2 w-full pr-4">
            <div className="flex items-center">
              <span
                className="duration-200 hover:bg-gray-200/20 cursor-pointer px-1 py-1 rounded-full"
                onClick={() => setIsCommentModalOpen(true)}
                aria-label="comment-button"
              >
                <TbMessage size={20} color="rgb(161 161 170)" />
              </span>
              <span className="text-sm">{post.comments_count}</span>
            </div>
            <div className="flex items-center">
              <span
                className="duration-200 hover:bg-gray-200/20 cursor-pointer px-1 py-1 rounded-full"
                onClick={() => {
                  toggleLikeFetch({ postId: post.id });
                }}
                aria-label="like-button"
              >
                {post.liked ? (
                  <TbHeartFilled
                    aria-label="liked-icon"
                    size={22}
                    color="rgb(161 161 170)"
                  />
                ) : (
                  <CiHeart
                    aria-label="unliked-icon"
                    size={22}
                    color="rgb(161 161 170)"
                  />
                )}
              </span>
              <span className="text-sm">{post.likes_count}</span>
            </div>
            <div className="flex items-center">
              <span
                className=" duration-200 hover:bg-gray-200/20 cursor-pointer p-1 rounded-full"
                onClick={() => {
                  toggleBookmarkFetch({ postId: post.id });
                }}
                aria-label="bookmark-button"
              >
                {post.bookmarked ? (
                  <FaBookmark
                    size={20}
                    color="rgb(161 161 170)"
                    aria-label="bookmarked-icon"
                  />
                ) : (
                  <CiBookmark
                    size={20}
                    color="rgb(161 161 170)"
                    aria-label="unbookmarked-icon"
                  />
                )}
              </span>
            </div>
          </div>
          <CommentPostModal
            isOpen={isCommentModalOpen}
            setIsModalOpen={setIsCommentModalOpen}
            post={post}
          />
        </div>
      </div>
    </div>
  );
};

export default Post;
