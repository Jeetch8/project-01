import React, { useEffect, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useFetch } from '@/hooks/useFetch';
import { IPost, IPostMedia } from '@/types/interfaces';
import HashLoader from 'react-spinners/HashLoader';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LuZoomIn, LuZoomOut } from 'react-icons/lu';

interface PostMediaProps {
  url: string;
}

const PostMedia: React.FC<PostMediaProps> = ({ url }) => {
  const [media, setMedia] = useState<IPostMedia[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [nextPage, setNextPage] = useState(1);

  const { doFetch } = useFetch<{
    media: (IPostMedia & { post: IPost })[];
    hasMore: boolean;
    nextPage: number;
    currentPage: number;
  }>({
    url: `${url}?page=${nextPage}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setNextPage(data.nextPage);
      setMedia((prev) => [...prev, ...data.media]);
      setHasMore(data.hasMore);
    },
  });

  useEffect(() => {
    doFetch();
  }, [url]);

  if (media.length === 0) {
    return <div className="text-center py-8">No media found</div>;
  }

  return (
    <PhotoProvider
      toolbarRender={({ onScale, scale }) => {
        return (
          <div className="flex gap-x-3">
            <LuZoomIn
              size={25}
              className="cursor-pointer px-1 hover:bg-[rgba(108,122,137,0.4)] rounded-sm"
              onClick={() => onScale(scale + 1)}
            />
            <LuZoomOut
              size={25}
              className="cursor-pointer px-1 hover:bg-[rgba(108,122,137,0.4)] rounded-sm"
              onClick={() => onScale(scale - 1)}
            />
          </div>
        );
      }}
    >
      <div className="">
        <InfiniteScroll
          dataLength={media.length}
          next={doFetch}
          className="grid grid-cols-3 gap-1"
          hasMore={hasMore}
          loader={
            <div className="flex justify-center items-center p-5">
              <HashLoader color="#fff" />
            </div>
          }
          endMessage={
            <div className="text-center text-lg text-white mt-5">
              No more liked posts to show
            </div>
          }
        >
          {media?.map((item, index) => (
            <PhotoView key={index} src={item?.original_media_url}>
              <div className="aspect-square cursor-pointer">
                <img
                  src={item.original_media_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </PhotoView>
          ))}
        </InfiniteScroll>
      </div>
    </PhotoProvider>
  );
};

export default PostMedia;
