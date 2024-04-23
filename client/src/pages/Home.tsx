import Feed from '@/Components/Home/Feed';
import { base_url } from '@/utils/base_url';
import CreateNewPostBox from '@/Components/Home/CreateNewPost/CreateNewPost';
import { IFeedPost } from '@/utils/interfaces';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FetchStates, useFetch } from '@/hooks/useFetch';

const Home = () => {
  const [posts, setPosts] = useState<IFeedPost[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const { fetchState, doFetch } = useFetch<{
    posts: IFeedPost[];
    hasMore: boolean;
    nextPage: number;
  }>({
    url: `${base_url}/post/feed?page=${currentPage}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      console.log(data);
      setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      setHasMore(data.hasMore);
      setCurrentPage(data.nextPage);
    },
  });

  useEffect(() => {
    doFetch();
  }, []);

  useEffect(() => {
    if (fetchState === FetchStates.ERROR) {
      toast.error('Something went wrong');
    }
  }, [fetchState]);

  return (
    <div className="border-r-[2px] border-zinc-900 bg-black w-[620px] inline">
      <CreateNewPostBox fetchHomeFeed={doFetch} />
      {fetchState !== FetchStates.ERROR && (
        <Feed items={posts} hasMore={hasMore} fetchMoreData={doFetch} />
      )}
      {posts.length === 0 && <div className="h-[110vh]"></div>}
    </div>
  );
};

export default Home;
