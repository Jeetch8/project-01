import { useEffect, useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { ICommunity, IFeedPost } from '@/types/interfaces';
import CommunityTitleCard from '@/Components/Communities/CommunityTitleCard';
import useEmblaCarousel from 'embla-carousel-react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Post from '@/Components/Home/Post';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import InfiniteScroll from 'react-infinite-scroll-component';
import HashLoader from 'react-spinners/HashLoader';
import { GoArrowLeft } from 'react-icons/go';
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom';
import { TbUsersPlus } from 'react-icons/tb';
import CreateCommunityModal from '@/Components/Modals/CreateCommunityModal';
import { FaSearch } from 'react-icons/fa';

const Communities = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<ICommunity[]>([]);
  const [posts, setPosts] = useState<IFeedPost[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: 'start',
      dragFree: true,
    },
    [WheelGesturesPlugin()]
  );

  const { doFetch, fetchState } = useFetch<{
    communities: ICommunity[];
    posts: { posts: IFeedPost[]; hasMore: boolean; nextPage: number };
  }>({
    url: `${base_url}/user/communities?page=${currentPage}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setCommunities(data.communities);
      setPosts((prevPosts) => [...prevPosts, ...data.posts.posts]);
      setHasMore(data.posts.hasMore);
      setCurrentPage(data.posts.nextPage);
    },
  });

  useEffect(() => {
    doFetch();
  }, []);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="border-r-[2px] border-zinc-900 bg-black w-[620px] text-white">
      <div className="flex items-center gap-x-2 ml-2 backdrop-blur-md justify-between sticky top-0">
        <div className="flex items-center gap-x-2">
          <a
            onClick={() => navigate(-1)}
            data-tooltip-id={`community-back`}
            data-tooltip-content={'back'}
          >
            <GoArrowLeft
              size={38}
              className="px-2 py-2 hover:bg-[rgba(108,122,137,0.4)] transition-all  rounded-full cursor-pointer duration-300"
            />
          </a>
          <Tooltip id={`community-back`} />
          <h1 className="text-2xl font-bold p-4">Communities</h1>
        </div>
        <div className="flex items-center">
          <a
            onClick={() => navigate('/communities/search')}
            className="px-2 py-2 hover:bg-[rgba(108,122,137,0.4)] transition-all rounded-full cursor-pointer duration-300 mr-4"
            data-tooltip-id="community-search"
            data-tooltip-content="Search Communities"
          >
            <FaSearch size={20} />
          </a>
          <Tooltip id="community-search" />
          <a
            onClick={() => setIsModalOpen(true)}
            className="px-2 py-2 hover:bg-[rgba(108,122,137,0.4)] transition-all  rounded-full cursor-pointer duration-300 mr-4"
            data-tooltip-id={`community-create`}
            data-tooltip-content={'Create Community'}
          >
            <TbUsersPlus size={20} />
          </a>
          <Tooltip id={`community-create`} />
        </div>
      </div>

      <div className="relative group border-y-[2px] border-zinc-900 mt-8">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 p-4">
            {communities.map((community) => (
              <CommunityTitleCard key={community.id} community={community} />
            ))}
          </div>
        </div>

        {canScrollPrev && (
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <FaChevronLeft />
          </button>
        )}

        {canScrollNext && (
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <FaChevronRight />
          </button>
        )}
        {fetchState === 'loading' && (
          <div className="h-[100px] w-full flex justify-center items-center">
            <HashLoader color="#fff" />
          </div>
        )}
      </div>

      <div>
        <InfiniteScroll
          dataLength={posts.length}
          next={doFetch}
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
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </InfiniteScroll>
      </div>
      <CreateCommunityModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
};

export default Communities;
