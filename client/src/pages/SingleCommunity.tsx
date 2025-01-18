import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GoArrowLeft } from 'react-icons/go';
import { IoSettingsOutline } from 'react-icons/io5';
import { Tooltip } from 'react-tooltip';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { ICommunity, RolesInCommunity } from '@/types/interfaces';
import SidedProfileImgs from '@/Components/Chat/SidedProfileImgs';
import { IParticipant } from '@/types/socket';
import { Button } from '@/Components/Global/Button';
import { twMerge } from 'tailwind-merge';
import PostMedia from '@/Components/Profile/CreatedPostsMedia';
import CommunityLatestPosts from '@/Components/Community/CommunityLatestPosts';
import CommunityTopPosts from '@/Components/Community/CommunityTopPosts';
import SingleCommunityAboutTab from '@/Components/Community/SingleCommunityAboutTab';
import toast from 'react-hot-toast';
import numeral from 'numeral';

const SingleCommunity = () => {
  const navigate = useNavigate();
  const { communityId } = useParams();
  const [community, setCommunity] = useState<ICommunity | null>(null);
  const [activeTab, setActiveTab] = useState<
    'latest' | 'top' | 'media' | 'about'
  >('latest');

  const { doFetch, dataRef } = useFetch<{
    community: ICommunity;
    userRoleInCommunity: RolesInCommunity | undefined;
  }>({
    url: `${base_url}/community/${communityId}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setCommunity(data.community);
    },
  });

  const { doFetch: joinCommunity } = useFetch({
    url: `${base_url}/community/${communityId}/join`,
    method: 'POST',
    authorized: true,
    onSuccess: () => {
      toast.success('Joined community successfully');
      doFetch(); // Refetch community data
    },
    onError: () => {
      toast.error('Failed to join community');
    },
  });

  const { doFetch: leaveCommunity } = useFetch({
    url: `${base_url}/community/${communityId}/leave`,
    method: 'POST',
    authorized: true,
    onSuccess: () => {
      toast.success('Left community successfully');
      doFetch(); // Refetch community data
    },
    onError: () => {
      toast.error('Failed to leave community');
    },
  });

  useEffect(() => {
    doFetch();
  }, []);

  console.log(community);

  return (
    <div className="border-r-[2px] border-zinc-900 bg-black w-[620px] text-white">
      <div className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-x-2 ml-2 p-2">
          <a
            onClick={() => navigate(-1)}
            data-tooltip-id="community-back"
            data-tooltip-content="Back"
          >
            <GoArrowLeft
              size={38}
              className="px-2 py-2 hover:bg-[rgba(108,122,137,0.4)] transition-all rounded-full cursor-pointer duration-300"
            />
          </a>
          <Tooltip id="community-back" />
          <h1 className="text-2xl font-bold">{community?.title}</h1>
        </div>
        <div className="mr-2">
          {dataRef.current?.userRoleInCommunity === RolesInCommunity.ADMIN && (
            <a
              onClick={() =>
                navigate(`/communities/${community?.id}/admin/settings/`)
              }
              className="px-2 py-2 block hover:bg-[rgba(108,122,137,0.4)] transition-all rounded-full cursor-pointer duration-300"
              data-tooltip-id="community-settings"
              data-tooltip-content="Settings"
            >
              <IoSettingsOutline size={20} />
            </a>
          )}
          <Tooltip id="community-settings" />
        </div>
      </div>

      {community && (
        <>
          <div className="h-[250px] overflow-hidden">
            <img
              src={community.banner_img}
              alt={`${community.title} banner`}
              className="w-full object-cover"
            />
          </div>
          <div className="p-4 bg-[rgba(55,63,71,0.4)]">
            <h2 className="text-3xl font-bold mb-2">{community.title}</h2>
            <p className="mb-4">{community.description}</p>
            <div className="flex justify-between">
              <button className="flex px-2 py-2 gap-x-3 rounded-md hover:bg-[rgba(108,122,137,0.4)]">
                {typeof community.members[0] === 'object' && (
                  <SidedProfileImgs
                    participants={community.members as IParticipant[]}
                  />
                )}
                <span className="text-gray-400">
                  <span className="font-semibold text-white">
                    {numeral(community.members_count).format('0.[00]a')}
                  </span>{' '}
                  Members
                </span>
              </button>
              <Button
                variant="outline"
                className="rounded-full px-5"
                onClick={() =>
                  dataRef.current?.userRoleInCommunity
                    ? leaveCommunity()
                    : joinCommunity()
                }
              >
                {dataRef.current?.userRoleInCommunity ? 'Leave' : 'Join'}
              </Button>
            </div>
          </div>
        </>
      )}

      <div className="border-b-[1px] border-gray-700 mt-4">
        <div className="flex font-medium">
          {['latest', 'top', 'media'].map((tab) => (
            <div
              key={tab}
              className="pt-[15px] cursor-pointer text-gray-500 hover:bg-zinc-800 group duration-200 w-full"
              onClick={() => setActiveTab(tab as 'latest' | 'top' | 'media')}
            >
              <p
                className={twMerge(
                  'border-b-[3px] rounded-sm pb-[2vh] border-transparent w-fit mx-auto duration-200',
                  activeTab === tab && 'border-blue-400 text-white'
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'latest' && (
          <CommunityLatestPosts communityId={communityId!} />
        )}
        {activeTab === 'top' && (
          <CommunityTopPosts communityId={communityId!} />
        )}
        {activeTab === 'media' && (
          <PostMedia url={`${base_url}/community/${communityId}/post/media`} />
        )}
        {activeTab === 'about' && community && (
          <SingleCommunityAboutTab community={community} />
        )}
      </div>
    </div>
  );
};

export default SingleCommunity;
