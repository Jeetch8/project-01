import { useState, useEffect } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import InfiniteScroll from 'react-infinite-scroll-component';
import { HashLoader } from 'react-spinners';
import AvatarImage from '../Global/AvatarImage';
import { useParams } from 'react-router-dom';
import { IUser } from '@/utils/interfaces';

interface Member extends IUser {
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

const CommunityMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { communityId } = useParams();

  const { doFetch: fetchMembers } = useFetch<{
    members: Member[];
    hasMore: boolean;
    nextPage: number;
    currentPage: number;
  }>({
    url: `${base_url}/community/${communityId}/members?page=${page}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setMembers((prev) => [...prev, ...data.members]);
      setHasMore(data.hasMore);
      setPage(data.nextPage);
    },
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const renderMemberCard = (member: Member) => (
    <div
      key={member.id}
      className="flex items-center p-4 bg-zinc-800 rounded-lg mb-2"
    >
      <AvatarImage url={member.profile_img} diameter="40px" />
      <div className="ml-4 flex-grow">
        <div className="flex items-center gap-x-2">
          <p className="font-bold">{member.full_name}</p>{' '}
          <span className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs">
            {member.role}
          </span>
        </div>
        <p className="text-sm text-gray-400">@{member.username}</p>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Edit Members</h2>
      <InfiniteScroll
        dataLength={members.length}
        next={fetchMembers}
        hasMore={hasMore}
        loader={<HashLoader color="#fff" />}
      >
        {members
          .sort((a, b) => {
            if (a.role === 'ADMIN') return -1;
            if (b.role === 'ADMIN') return 1;
            if (a.role === 'MODERATOR') return -1;
            if (b.role === 'MODERATOR') return 1;
            return 0;
          })
          .map(renderMemberCard)}
      </InfiniteScroll>
    </div>
  );
};

export default CommunityMembers;
