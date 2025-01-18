import { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { IFeedPost } from '@/types/interfaces';
import Post from '@/Components/Home/Post';
import InfiniteScroll from 'react-infinite-scroll-component';
import HashLoader from 'react-spinners/HashLoader';

interface CommunityTopPostsProps {
  communityId: string;
}

const CommunityTopPosts: React.FC<CommunityTopPostsProps> = ({
  communityId,
}) => {
  const [posts, setPosts] = useState<IFeedPost[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { doFetch } = useFetch<{
    posts: IFeedPost[];
    hasMore: boolean;
    nextPage: number;
  }>({
    url: `${base_url}/community/${communityId}/post/top?page=${currentPage}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      setHasMore(data.hasMore);
      setCurrentPage(data.nextPage);
    },
  });

  useEffect(() => {
    doFetch();
  }, []);

  const fetchMorePosts = () => {
    doFetch();
  };

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchMorePosts}
      hasMore={hasMore}
      loader={
        <div className="flex justify-center items-center p-5 mt-14">
          <HashLoader color="#fff" />
        </div>
      }
      endMessage={
        <div className="text-center text-lg text-white mt-5 h-[20vh]">
          <p>No more posts to show</p>
        </div>
      }
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </InfiniteScroll>
  );
};

export default CommunityTopPosts;
