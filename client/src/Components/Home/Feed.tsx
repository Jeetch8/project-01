interface Props {
  fetchHomeFeed: () => void;
  data: IPost[] | undefined;
}

import React, { useEffect } from 'react';
import Post from './Post';
import { IPost } from '@/utils/interfaces';

const Feed = ({ fetchHomeFeed, data }: Props) => {
  useEffect(() => {
    fetchHomeFeed();
  }, []);
  console.log(data);

  return (
    <div>
      {data ? (
        data?.map((post) => {
          return <Post key={post.id} post={post} />;
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
