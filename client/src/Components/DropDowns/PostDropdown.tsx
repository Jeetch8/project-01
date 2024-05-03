import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaThumbtack } from 'react-icons/fa';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import toast from 'react-hot-toast';
import { IFeedPost } from '@/utils/interfaces';

interface PostDropdownProps {
  post: IFeedPost;
  isAdmin: boolean;
}

const PostDropdown: React.FC<PostDropdownProps> = ({ post, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { doFetch: pinPost } = useFetch({
    url: `${base_url}/community/${post.communityId}/pin/${post.id}`,
    method: 'POST',
    authorized: true,
    onSuccess: () => {
      toast.success('Post pinned successfully');
      setIsOpen(false);
    },
    onError: () => {
      toast.error('Failed to pin post');
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isAdmin || !post.isCommunityPost) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-500 hover:text-white"
      >
        <FaEllipsisV />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-zinc-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white"
              onClick={() => pinPost()}
            >
              <FaThumbtack className="mr-2 h-5 w-5" />
              Pin Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDropdown;
