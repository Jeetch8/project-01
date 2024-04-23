import React, { useState, useEffect } from 'react';
import { IFeedPost } from '@/utils/interfaces';
import { base_url } from '@/utils/base_url';
import { useFetch } from '@/hooks/useFetch';
import PostsTab from '@/Components/Explore/PostsTab';
import UsersTab from '@/Components/Explore/UsersTab';

const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts');
  const [posts, setPosts] = useState<IFeedPost[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [currentPostPage, setCurrentPostPage] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { doFetch: fetchPosts } = useFetch<{
    posts: IFeedPost[];
    hasMore: boolean;
    nextPage: number;
  }>({
    url: `${base_url}/post/search?page=${currentPostPage}&query=${searchQuery}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setPosts((prevPosts) =>
        currentPostPage === 1 ? data.posts : [...prevPosts, ...data.posts]
      );
      setHasMorePosts(data.hasMore);
      setCurrentPostPage(data.nextPage);
    },
  });

  const { doFetch: fetchUsers } = useFetch<{
    users: any[];
    hasMore: boolean;
    nextPage: number;
  }>({
    url: `${base_url}/user?page=${currentUserPage}&query=${searchQuery}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setUsers((prevUsers) =>
        currentUserPage === 1 ? data.users : [...prevUsers, ...data.users]
      );
      setHasMoreUsers(data.hasMore);
      setCurrentUserPage(data.nextPage);
    },
  });

  const clearSearchStates = () => {
    setPosts([]);
    setUsers([]);
    setHasMorePosts(true);
    setHasMoreUsers(true);
    setCurrentPostPage(1);
    setCurrentUserPage(1);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      clearSearchStates();
      setHasSearched(true);
      if (activeTab === 'posts') {
        fetchPosts();
      } else {
        fetchUsers();
      }
    }
  };

  const handleTabChange = (tab: 'posts' | 'users') => {
    setActiveTab(tab);
    if (hasSearched) {
      if (tab === 'posts' && posts.length === 0) {
        fetchPosts();
      } else if (tab === 'users' && users.length === 0) {
        fetchUsers();
      }
    }
  };

  const renderTabContent = () => {
    if (!hasSearched) {
      return (
        <div className="flex justify-center items-center h-[50vh] text-gray-500">
          <p>Enter a search query and press Enter to see results</p>
        </div>
      );
    }

    if (activeTab === 'posts') {
      return (
        <PostsTab
          posts={posts}
          hasMore={hasMorePosts}
          fetchMorePosts={fetchPosts}
        />
      );
    } else {
      return (
        <UsersTab
          users={users}
          hasMore={hasMoreUsers}
          fetchMoreUsers={fetchUsers}
        />
      );
    }
  };

  return (
    <div className="w-[620px] text-white border-r-[1px] border-neutral-800">
      <div className="bg-[rgba(0,0,0,0.9)] backdrop-blur-xl sticky top-0 z-50">
        <div className="border-b border-neutral-800 p-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search"
            className="w-full bg-transparent text-white border-[2px] border-zinc-900 rounded-full px-4 py-2 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex border-b border-neutral-800">
          <button
            className={`flex-1 py-2 text-center border-b-2 border-black transition-all duration-300 hover:bg-neutral-900 ${
              activeTab === 'posts' ? 'border-blue-500' : ''
            }`}
            onClick={() => handleTabChange('posts')}
          >
            Posts
          </button>
          <button
            className={`flex-1 py-2 text-center border-b-2 border-black transition-all duration-300 hover:bg-neutral-900 ${
              activeTab === 'users' ? 'border-blue-500' : ''
            }`}
            onClick={() => handleTabChange('users')}
          >
            People
          </button>
        </div>
      </div>
      {renderTabContent()}
    </div>
  );
};

export default Explore;
