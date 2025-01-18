import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import InfiniteScroll from 'react-infinite-scroll-component';
import { HashLoader } from 'react-spinners';
import AvatarImage from '../Global/AvatarImage';
import { useNavigate, useParams } from 'react-router-dom';
import { IUser } from '@/types/interfaces';
import { FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useDebounce from '@/hooks/useDebounce';

interface Member extends IUser {
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

const CommunityMembers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { communityId } = useParams();
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');

  const debouncedQuery = useDebounce(query, 300);

  const { doFetch: fetchMembers } = useFetch<{
    members: Member[];
    hasMore: boolean;
    nextPage: number;
    currentPage: number;
  }>({
    url: `${base_url}/community/${communityId}/members`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setMembers((prev) => [...prev, ...data.members]);
      setHasMore(data.hasMore);
      setPage(data.nextPage);
    },
    onUnAuthorisedAccessError: () => {
      toast.error('You are not authorized to access this page');
      navigate(-1);
    },
  });

  const fetchMembersCallback = useCallback(() => {
    fetchMembers(
      undefined,
      `${base_url}/community/${communityId}/members?page=${page}&query=${debouncedQuery}&role=${selectedRole}`
    );
  }, [debouncedQuery, selectedRole, page]);

  useEffect(() => {
    setPage(1);
    setMembers([]);
    fetchMembersCallback();
  }, [debouncedQuery, selectedRole]);

  const { doFetch: updateRole } = useFetch({
    url: `${base_url}/community/${communityId}/member/`,
    method: 'PATCH',
    authorized: true,
    onSuccess: () => {
      toast.success('Member role updated successfully');
      fetchMembers();
    },
    onUnAuthorisedAccessError: () => {
      toast.error('You are not authorized to access this page');
      navigate(-1);
    },
  });

  const handleRoleChange = async (userId: string, role: string) => {
    await updateRole(
      { role },
      `${base_url}/community/${communityId}/member/${userId}/role`
    );
  };

  const renderMemberCard = (member: Member) => (
    <div
      key={member.id}
      className="flex justify-between items-start p-4 bg-zinc-800 rounded-lg mb-2"
    >
      <div className="flex items-center">
        <AvatarImage url={member.profile_img} diameter="40px" />
        <div className="ml-4 flex-grow">
          <div className="flex items-center gap-x-2">
            <p className="font-bold">{member.full_name}</p>{' '}
          </div>
          <p className="text-sm text-gray-400">@{member.username}</p>
        </div>
      </div>
      <select
        name="role_selector"
        id="role_selector"
        className="bg-black text-white px-4 py-2 rounded-lg"
        style={{
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
        }}
        value={member.role}
        onChange={(e) => handleRoleChange(member.id, e.target.value)}
      >
        <option className="text-white" value="ADMIN">
          Admin
        </option>
        <option className="text-white" value="MODERATOR">
          Moderator
        </option>
        <option className="text-white" value="MEMBER">
          Member
        </option>
      </select>
    </div>
  );

  return (
    <div className="w-full">
      <div className="sticky top-0 bg-[rgba(0,0,0,0.9)] backdrop-blur-xl z-50 px-2 py-2">
        <h2 className="text-2xl font-bold mb-4">Edit Members</h2>
      </div>
      <div className="relative flex items-center border-[2px] border-zinc-800 rounded-full px-6 py-1 mb-6 group focus-within:border-blue-500">
        <FaSearch className="text-gray-400 group-focus-within:text-blue-500" />
        <input
          type="text"
          className="w-full bg-transparent border-none px-4 py-2 group-focus:border-blue-500 outline-none"
          style={{
            transition: 'all 0.3s ease-in-out',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
          }}
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          name="role_selector"
          id="role_selector"
          className="bg-transparent border-none px-4 py-2"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
          }}
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="ALL">All</option>
          <option className="text-black" value="ADMIN">
            Admin
          </option>
          <option className="text-black" value="MODERATOR">
            Moderator
          </option>
          <option className="text-black" value="MEMBER">
            Member
          </option>
        </select>
      </div>
      <InfiniteScroll
        dataLength={members.length}
        next={fetchMembers}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center items-center h-[100px]">
            <HashLoader color="#fff" />
          </div>
        }
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
