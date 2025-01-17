import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { ICommunity } from '@/utils/interfaces';
import { GoArrowLeft } from 'react-icons/go';
import { FaSearch } from 'react-icons/fa';
import SidedProfileImgs from '@/Components/Chat/SidedProfileImgs';
import useDebounce from '@/hooks/useDebounce';
import InfiniteScroll from 'react-infinite-scroll-component';
import HashLoader from 'react-spinners/HashLoader';
import { IParticipant } from '@server/src/socket/socket.types';
import numeral from 'numeral';

const CommunitiesSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [communities, setCommunities] = useState<ICommunity[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { doFetch, fetchState } = useFetch<{
    communities: ICommunity[];
    hasMore: boolean;
    nextPage: number;
  }>({
    url: `${base_url}/community/search`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      if (page === 1) {
        setCommunities(data.communities);
      } else {
        setCommunities((prev) => [...prev, ...data.communities]);
      }
      setHasMore(data.hasMore);
      setPage(data.nextPage);
    },
  });

  const fetchCommunities = useCallback(() => {
    doFetch(
      undefined,
      `${base_url}/community/search?query=${debouncedSearchQuery}&page=${page}`
    );
  }, [debouncedSearchQuery, page]);

  useEffect(() => {
    setPage(1);
    setCommunities([]);
    fetchCommunities();
  }, [debouncedSearchQuery]);

  const loadMore = () => {
    if (hasMore) {
      fetchCommunities();
    }
  };

  return (
    <div className="border-r-[2px] border-zinc-900 bg-black w-[620px] text-white">
      <div className="sticky top-0 bg-black z-10 p-4 flex items-center gap-4">
        <GoArrowLeft
          size={24}
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search communities"
            className="w-full bg-zinc-900 rounded-full py-2 px-4 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <h2 className="text-2xl font-bold px-4 my-4">Discover Communities</h2>
      <InfiniteScroll
        dataLength={communities.length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center items-center p-5">
            <HashLoader color="#fff" />
          </div>
        }
        endMessage={
          <p className="text-center my-5">No more communities to show</p>
        }
      >
        <div className="space-y-2 px-4">
          {communities.map((community) => (
            <div
              key={community.id}
              className="flex space-x-4 py-3 px-2 rounded-lg hover:bg-neutral-950 cursor-pointer transition-colors duration-200"
              onClick={() => navigate(`/communities/${community.id}`)}
            >
              <img
                src={community.banner_img}
                alt={community.title}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold">{community.title}</h3>
                <p className="text-sm text-gray-400">
                  <span className="font-semibold text-white">
                    {numeral(community.members_count).format('0.[00]a')}
                  </span>{' '}
                  members
                </p>
                <div className="mt-4">
                  <SidedProfileImgs
                    size="32px"
                    participants={community.members as IParticipant[]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default CommunitiesSearch;
