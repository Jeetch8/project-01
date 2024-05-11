import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import HashLoader from 'react-spinners/HashLoader';
import { IFeedPost } from '@/utils/interfaces';
import Post from '../Home/Post';

interface PostsTabProps {
  posts: IFeedPost[];
  hasMore: boolean;
  fetchMorePosts: () => void;
}

const PostsTab: React.FC<PostsTabProps> = ({
  posts,
  hasMore,
  fetchMorePosts,
}) => {
  return (
    <>
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchMorePosts}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center items-center p-5 mt-14">
            <HashLoader color="#fff" />
          </div>
        }
      >
        {posts.length > 0 ? (
          posts.map((post) => <Post key={post.id} post={post} />)
        ) : (
          <div className="text-center text-lg text-white mt-5">
            <p>No posts found</p>
          </div>
        )}
      </InfiniteScroll>
      <div className="h-[100vh]"></div>
    </>
  );
};

export default PostsTab;
