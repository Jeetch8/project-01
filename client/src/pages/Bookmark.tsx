import { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import Post from '@/Components/Home/Post';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IFeedPost } from '@/utils/interfaces';
import { HashLoader } from 'react-spinners';
import { useGlobalContext } from '@/context/GlobalContext';

const Bookmark = () => {
  const { user } = useGlobalContext();
  const [bookmarks, setBookmarks] = useState<IFeedPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { doFetch: fetchBookmarks } = useFetch({
    url: base_url + `/user/bookmarks?page=${currentPage}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data: {
      bookmarks: IFeedPost[];
      hasMore: boolean;
      nextPage: number;
    }) => {
      setBookmarks((prev) => [...prev, ...data.bookmarks]);
      setHasMore(data.hasMore);
      setCurrentPage(data.nextPage);
    },
  });

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="mx-auto text-white w-[620px] border-r-[2px] border-zinc-900">
      <nav className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm px-4 py-3">
        <h1 className="text-[20px] font-semibold leading-5">Bookmarks</h1>
        <p className="text-sm text-gray-500">@{user?.username}</p>
      </nav>
      <InfiniteScroll
        dataLength={bookmarks.length}
        next={fetchBookmarks}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center items-center p-5">
            <HashLoader color="#fff" />
          </div>
        }
        endMessage={
          <p className="text-center text-gray-500 py-4">
            {bookmarks.length === 0 ? 'No bookmarks' : 'No more bookmarks'}
          </p>
        }
      >
        {bookmarks.map((bookmark) => (
          <Post key={bookmark.id} post={bookmark} />
        ))}
      </InfiniteScroll>
      <div className="h-[110vh]"></div>
    </div>
  );
};

export default Bookmark;
