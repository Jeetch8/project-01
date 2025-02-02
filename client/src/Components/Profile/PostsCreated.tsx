import { useState, useEffect } from 'react';
import { base_url } from '@/utils/base_url';
import { IFeedPost } from '@/types/interfaces';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from '@/Components/Home/Post';
import { toast } from 'react-hot-toast';
import { useFetch } from '@/hooks/useFetch';
import { useParams } from 'react-router-dom';
import { HashLoader } from 'react-spinners';

const PostsCreated: React.FC = () => {
  const [posts, setPosts] = useState<IFeedPost[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { username: paramsUserName } = useParams();

  const { fetchState, doFetch } = useFetch<{
    posts: IFeedPost[];
    hasMore: boolean;
    nextPage: number;
  }>({
    url: `${base_url}/user/${paramsUserName}/posts?page=${currentPage}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      setHasMore(data.hasMore);
      setCurrentPage(data.nextPage);
    },
    onError: () => {
      toast.error('Something went wrong');
    },
  });

  useEffect(() => {
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fetchState === 'error') {
    return <div className="h-[50vh]"></div>;
  }

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
            No more posts to show
          </div>
        }
      >
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </InfiniteScroll>
      {posts.length === 0 && <div className="h-[50vh]"></div>}
    </div>
  );
};

export default PostsCreated;
