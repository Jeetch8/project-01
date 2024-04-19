interface Props {
  items: IFeedPost[];
  hasMore: boolean;
  fetchMoreData: () => void;
}

import Post from './Post';
import { IFeedPost } from '@/utils/interfaces';
import InfinteScroll from 'react-infinite-scroll-component';
import HashLoader from 'react-spinners/HashLoader';

const Feed = ({ items, hasMore, fetchMoreData }: Props) => {
  return (
    <div>
      <InfinteScroll
        dataLength={items.length}
        next={fetchMoreData}
        hasMore={hasMore}
        endMessage={
          <div className="text-center text-lg text-white mt-5">
            No posts to show
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
      </InfinteScroll>
    </div>
  );
};

export default Feed;
