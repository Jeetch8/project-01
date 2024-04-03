import { useState, useEffect } from 'react';
import { base_url } from '@/utils/base_url';
import { IFeedPost } from '@/utils/interfaces';
import InfiniteScroll from 'react-infinite-scroll-component';
import BounceLoader from 'react-spinners/BounceLoader';
import Post from '@/Components/Home/Post';
import { getTokenFromLocalStorage } from '@/utils/localstorage';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

type Props = {
  hasMore: boolean | undefined;
  nextPage: number | undefined;
  currentPage: number | undefined;
  posts: IFeedPost[] | undefined;
};

const PostsCreated: React.FC<Props> = ({
  posts: initialPosts,
  hasMore: initialHasMore,
  nextPage: initialNextPage,
  currentPage: initialCurrentPage,
}) => {
  const [posts, setPosts] = useState<IFeedPost[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    setPosts(initialPosts || []);
    setHasMore(initialHasMore || false);
    setCurrentPage(initialCurrentPage || 0);
  }, [initialPosts, initialHasMore, initialCurrentPage]);

  const fetchMoreData = () => {
    const token = getTokenFromLocalStorage();
    if (!token) {
      toast.error('Please login');
      navigate('/login');
      return;
    }

    fetch(base_url + `/user/posts?page=${currentPage}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Please login');
            navigate('/login');
            throw new Error('Unauthorized');
          }
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setPosts((prevPosts) => [...prevPosts, ...data.posts]);
        setHasMore(data.hasMore);
        setCurrentPage(data.nextPage);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="border-r-[2px] border-zinc-900 bg-black max-w-[600px] inline w-full">
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center items-center p-5">
            <BounceLoader color="#fff" />
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
