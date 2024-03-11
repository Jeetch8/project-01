interface Props {
  fetchHomeFeed: () => void;
  data: any;
}

import React, { useEffect } from 'react';
import Post from './Post';

const Feed = ({ fetchHomeFeed, data }: Props) => {
  useEffect(() => {
    fetchHomeFeed();
  }, []);

  return (
    <div>
      {data.current?.post?.length > 0 ? (
        data.current?.post?.map((post) => {
          return <Post key={post._id} post={post} />;
        })
      ) : (
        <div className="text-center text-lg text-white mt-5">
          No posts to show
        </div>
      )}
    </div>
  );
};

export default Feed;
