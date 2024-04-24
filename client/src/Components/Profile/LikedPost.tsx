import { useState, useEffect } from 'react';
import { base_url } from '@/utils/base_url';
import { IFeedPost } from '@/utils/interfaces';
import InfiniteScroll from 'react-infinite-scroll-component';
import HashLoader from 'react-spinners/HashLoader';
import Post from '@/Components/Home/Post';
import { useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';

const LikedPost = () => {
  const [posts, setPosts] = useState<IFeedPost[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [nextPage, setNextPage] = useState(1);
  const { username: paramsUserName } = useParams();

  const { doFetch } = useFetch<{
    posts: IFeedPost[];
    hasMore: boolean;
    nextPage: number;
  }>({
    url: `${base_url}/user/${paramsUserName}/liked-posts?page=${nextPage}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setNextPage(data.nextPage);
      setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      setHasMore(data.hasMore);
    },
  });

  useEffect(() => {
    doFetch();
  }, []);

  return (
    <div className="border-r-[2px] border-zinc-900 bg-black max-w-[600px] inline w-full">
      <InfiniteScroll
        dataLength={posts.length}
        next={doFetch}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center items-center p-5">
            <HashLoader color="#fff" />
          </div>
        }
        endMessage={
          <div className="text-center text-lg text-white mt-5">
            No more liked posts to show
          </div>
        }
      >
        {posts.map((post, index) => (
          <Post key={index} post={post} />
        ))}
      </InfiniteScroll>
      {posts.length === 0 && <div className="h-[50vh]"></div>}
    </div>
  );
};

export default LikedPost;
