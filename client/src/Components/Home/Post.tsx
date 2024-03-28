import React from 'react';
import AvatarImage from '@/Components/Global/AvatarImage';
import { SlOptions } from 'react-icons/sl';
import { TbHeartFilled, TbMessage } from 'react-icons/tb';
import { CiHeart } from 'react-icons/ci';
import { CiBookmark } from 'react-icons/ci';
import PostImages from './PostImages';
// import Comments from "./Comments";
import { FaBookmark } from 'react-icons/fa';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { IFeedPost } from '@/utils/interfaces';
import CommentPostModal from '@/Components/Modals/CommentPostModal';

const Post = ({ post }: { post: IFeedPost }) => {
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
    url: base_url + `/post/${post.id}/bookmark`,
    authorized: true,
    method: 'PATCH',
    onSuccess: (res: { post: IFeedPost }) => {
      post.bookmarked = res.post.bookmarked;
    },
  });

  return (
    <div className="border-b-[1px] border-zinc-700 px-4 pt-3 pb-3 text-white">
      <div className="flex gap-x-2 items-start w-full">
        <div>
          <AvatarImage url={post?.creator?.profile_img} diameter={'42px'} />
        </div>
        <div className="w-full pr-2">
          <div className="flex justify-between">
            <div>
              <span className="font-bold mr-1">{post?.creator?.full_name}</span>
              <span className="font-light text-gray-500 ml-1">
                @{post?.creator?.username}
              </span>
              <span> · </span>
              <span className="text-sm text-gray-500 ml-1">
                {post?.timeAgo}
              </span>
            </div>
            <SlOptions color="rgb(113 113 112)" />
          </div>
          <p>{post.caption}</p>
          {post?.media?.length > 0 && (
            <div className="rounded-xl overflow-hidden mt-2">
              <PostImages media={post.media} />
            </div>
          )}
          <div className="mt-1 flex justify-between mr-2 w-full pr-4">
            <div className="flex items-center">
              <span
                className="duration-200 hover:bg-gray-200/20 cursor-pointer px-1 py-1 rounded-full"
                onClick={() => setIsCommentModalOpen(true)}
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
              >
                {post.liked ? (
                  <TbHeartFilled size={22} color="rgb(161 161 170)" />
                ) : (
                  <CiHeart size={22} color="rgb(161 161 170)" />
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
              >
                {post.bookmarked ? (
                  <FaBookmark size={20} color="rgb(161 161 170)" />
                ) : (
                  <CiBookmark size={20} color="rgb(161 161 170)" />
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
