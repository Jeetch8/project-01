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
import { IPost } from '@/utils/interfaces';

const Post = ({ post }: { post: IPost }) => {
  const [isCommentOpen, setIsCommentOpen] = React.useState<boolean>(false);
  const { doFetch: likePostFetch } = useFetch({
    url: base_url + '/post/like',
    authorized: true,
    method: 'PATCH',
    onSuccess: (res) => {
      post.liked = true;
      post.likes_count = res.post.likes;
    },
  });
  const { doFetch: unlikePostFetch } = useFetch({
    url: base_url + '/post/unlike',
    authorized: true,
    method: 'PATCH',
    onSuccess: (res) => {
      post.liked = false;
      post.likes_count = res.post.likes;
    },
  });
  const { doFetch: commentOnPostFetch } = useFetch({
    url: base_url + '/post/comment',
    authorized: true,
    method: 'PUT',
    onSuccess: (res) => {
      post.comments = res.post.comments;
    },
  });
  const { doFetch: bookmarkPostFetch } = useFetch({
    url: base_url + '/bookmark/',
    authorized: true,
    method: 'PATCH',
    onSuccess: (res) => {
      post.bookmarked = true;
    },
  });

  const { doFetch: unBookmarkPostFetch } = useFetch({
    url: base_url + '/bookmark/',
    authorized: true,
    method: 'DELETE',
    onSuccess: (res) => {
      post.bookmarked = false;
    },
  });

  console.log(post);

  return (
    <div className="border-b-[1px] border-zinc-700 px-4 pt-3 pb-3 text-white">
      <div className="flex gap-x-2 items-start w-full">
        <div>
          <AvatarImage
            url={
              'https://img.freepik.com/free-vector/hand-drawn-one-line-art-illustration_23-2149279746.jpg?w=826&t=st=1715601394~exp=1715601994~hmac=8d768525d904e063a96a0c7025ee24738530d8b5493f0975347fccad297f1a76'
            }
            diameter={'42px'}
          />
        </div>
        <div className="w-full pr-2">
          <div className="flex justify-between">
            <div>
              <span className="font-bold mr-1">{post?.creator?.full_name}</span>
              <span className="font-light text-gray-500 ml-1">
                @{post?.creator?.username}
              </span>
              <span> · </span>
              {/* <span className="text-sm text-gray-500 ml-1">
                {post?.timeAgo}
              </span> */}
            </div>
            <SlOptions color="rgb(113 113 112)" />
          </div>
          <p>{post.caption}</p>
          {post?.media?.length > 0 && (
            <div className="rounded-xl overflow-hidden mt-2">
              <PostImages media={post.media} />
            </div>
          )}
          <div className="mt-2 flex justify-between mr-2 w-full pr-4">
            <div className="flex items-center">
              <span
                className=" duration-200 hover:bg-[rgba(25,155,240,0.5)] cursor-pointer px-1 py-1 rounded-full"
                onClick={() => setIsCommentOpen((prev) => !prev)}
              >
                <TbMessage size={20} color="rgb(161 161 170)" />
              </span>
              <span className="text-sm">{post?.comments?.length}</span>
            </div>
            <div className="flex items-center">
              <span
                className=" duration-200 hover:bg-gray-200 cursor-pointer px-1 py-1 rounded-full"
                onClick={() => {
                  post.liked
                    ? unlikePostFetch({ postId: post.id })
                    : likePostFetch({ postId: post.id });
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
                className=" duration-200 hover:bg-gray-200 cursor-pointer px-1 py-1 rounded-full"
                onClick={() => {
                  post.bookmarked
                    ? unBookmarkPostFetch({ postId: post.id })
                    : bookmarkPostFetch({ postId: post.id });
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
          {/* {isCommentOpen && (
            <Comments commentOnPostFetch={commentOnPostFetch} post={post} />
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Post;
