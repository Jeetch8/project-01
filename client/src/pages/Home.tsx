import Feed from '@/Components/Home/Feed';
import CreatePost from '@/Components/Home/CreatePost';
import { base_url } from '@/utils/base_url';
import { useFetch } from '@/hooks/useFetch';
import CreateNewPostBox from '@/Components/Home/CreateNewPost/CreateNewPost';
import { IPost } from '@/utils/interfaces';

const Home = () => {
  const { doFetch: fetchHomeFeed, dataRef: homeFeedData } = useFetch<{
    feed: IPost[];
  }>({
    url: base_url + '/post/feed',
    method: 'GET',
    authorized: true,
  });

  return (
    <div className="border-r-[0.1px] border-zinc-700 bg-black max-w-[600px] inline w-full">
      {/* <CreatePost fetchHomeFeed={fetchHomeFeed} /> */}
      <CreateNewPostBox />
      <Feed fetchHomeFeed={fetchHomeFeed} data={homeFeedData.current?.feed} />
    </div>
  );
};

export default Home;
