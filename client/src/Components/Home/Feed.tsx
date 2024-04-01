interface Props {
  items: IFeedPost[];
  hasMore: boolean;
  fetchMoreData: () => void;
}

import Post from './Post';
import { IFeedPost } from '@/utils/interfaces';
import InfinteScroll from 'react-infinite-scroll-component';
import BounceLoader from 'react-spinners/BounceLoader';

const Feed = ({ items, hasMore, fetchMoreData }: Props) => {
  console.log(items);
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
          <div className="flex justify-center items-center p-5">
            <BounceLoader color="#fff" />
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
