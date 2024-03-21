import Feed from '@/Components/Home/Feed';
import CreatePost from '@/Components/Home/CreatePost';
import { base_url } from '@/utils/base_url';
import { useFetch } from '@/hooks/useFetch';
import CreateNewPostBox from '@/Components/Home/CreateNewPost/CreateNewPost';

const Home = () => {
  const { doFetch: fetchHomeFeed, dataRef: homeFeedData } = useFetch({
    url: base_url + '/post/feed',
    method: 'GET',
    authorized: true,
  });

  return (
    <div className="border-r-[0.1px] border-zinc-700 bg-black max-w-[600px] inline w-full">
      {/* <CreatePost fetchHomeFeed={fetchHomeFeed} /> */}
      <CreateNewPostBox />
      <Feed fetchHomeFeed={fetchHomeFeed} data={homeFeedData} />
    </div>
  );
};

export default Home;
