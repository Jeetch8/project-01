import React, { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import Post from '@/Components/Home/Post';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IFeedPost } from '@/utils/interfaces';
import { BounceLoader } from 'react-spinners';
import { useGlobalContext } from '@/context/GlobalContext';

const Bookmark = () => {
  const { user } = useGlobalContext();
  const [bookmarks, setBookmarks] = useState<IFeedPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { doFetch: fetchBookmarks } = useFetch({
    url: base_url + `/post/bookmarks?page=${currentPage}`,
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

  const { doFetch: toggleBookmarkFetch } = useFetch({
    url: base_url + '/post/',
    authorized: true,
    method: 'PATCH',
    onSuccess: () => {
      // Refresh the bookmarks after toggling
      setBookmarks([]);
      setCurrentPage(1);
      fetchBookmarks();
    },
  });

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="mx-auto text-white w-[600px] border-r-[2px] border-zinc-900">
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
            <BounceLoader color="#fff" />
          </div>
        }
        endMessage={
          <p className="text-center text-gray-500 py-4">
            {bookmarks.length === 0 ? 'No bookmarks' : 'No more bookmarks'}
          </p>
        }
      >
        {bookmarks.map((bookmark) => (
          <Post key={bookmark.id} post={bookmark} outerClassName="" />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default Bookmark;
