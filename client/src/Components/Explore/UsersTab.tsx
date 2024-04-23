import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import HashLoader from 'react-spinners/HashLoader';
import UserCardWithFollow from './UserCardWithFollow';

interface UsersTabProps {
  users: any[];
  hasMore: boolean;
  fetchMoreUsers: () => void;
}

const UsersTab: React.FC<UsersTabProps> = ({
  users,
  hasMore,
  fetchMoreUsers,
}) => {
  return (
    <>
      <InfiniteScroll
        dataLength={users.length}
        next={fetchMoreUsers}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center items-center p-5 mt-14">
            <HashLoader color="#fff" />
          </div>
        }
      >
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="p-4 border-b border-neutral-800">
              <UserCardWithFollow user={user} />
            </div>
          ))
        ) : (
          <div className="text-center text-lg text-white mt-5">
            <p>No users found</p>
          </div>
        )}
      </InfiniteScroll>
      <div className="h-[100vh]"></div>
    </>
  );
};

export default UsersTab;
