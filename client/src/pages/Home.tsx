import Feed from '@/Components/Home/Feed';
import { base_url } from '@/utils/base_url';
import CreateNewPostBox from '@/Components/Home/CreateNewPost/CreateNewPost';
import { IFeedPost } from '@/utils/interfaces';
import { useEffect, useState } from 'react';

const Home = () => {
  const [posts, setPosts] = useState<IFeedPost[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const fetchMoreData = () => {
    fetch(base_url + `/post/feed?page=${currentPage}`)
      .then((response) => response.json())
      .then((data) => {
        setPosts((prevPosts) => [...prevPosts, ...data.feed]);
        setHasMore(data.hasMore);
        setCurrentPage(data.nextPage);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchMoreData();
  }, []);

  console.log(hasMore, currentPage, posts.length);

  return (
    <div className="border-r-[2px] border-zinc-900 bg-black max-w-[600px] inline w-full">
      <CreateNewPostBox fetchHomeFeed={fetchMoreData} />
      <Feed items={posts} hasMore={hasMore} fetchMoreData={fetchMoreData} />
    </div>
  );
};

export default Home;
