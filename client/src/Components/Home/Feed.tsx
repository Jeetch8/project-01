interface Props {
  items: IFeedPost[];
  hasMore: boolean;
  fetchMoreData: () => void;
}

import Post from './Post';
import { IFeedPost } from '@/types/interfaces';
import InfiniteScroll from 'react-infinite-scroll-component';
import HashLoader from 'react-spinners/HashLoader';

const Feed = ({ items, hasMore, fetchMoreData }: Props) => {
  return (
    <div>
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMoreData}
        hasMore={hasMore}
        endMessage={
          <div className="text-center text-lg text-white mt-5 h-[20vh]">
            <p>No posts to show</p>
          </div>
        }
        loader={
          <div className="flex justify-center items-center p-5 mt-14">
            <HashLoader color="#fff" />
          </div>
        }
      >
        {items?.map((post, ind) => {
          return <Post key={ind} post={post} />;
        })}
      </InfiniteScroll>
    </div>
  );
};

export default Feed;
