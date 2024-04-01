import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import AvatarImage from '@/Components/Global/AvatarImage';
import { IFeedPost } from '@/utils/interfaces';
import { useGlobalContext } from '@/context/GlobalContext';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import TextareaAutoSize from 'react-textarea-autosize';
import MediaAssetsPreview from '@/Components/Home/CreateNewPost/ExtraAssets/MediaAssetsPreview';
import PostExtraAsset from '@/Components/Home/CreateNewPost/PostExtraAsset';

interface CommentPostModalProps {
  isOpen: boolean;
  post: IFeedPost;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CommentPostModal: React.FC<CommentPostModalProps> = ({
  isOpen,
  post,
  setIsModalOpen,
}) => {
  const [comment, setComment] = useState('');
  const [extraAssetsState, setExtraAssetsState] = useState<string[]>([]);
  const { user } = useGlobalContext();

  const { doFetch: commentOnPostFetch } = useFetch({
    url: base_url + `/post/${post.id}/comment`,
    authorized: true,
    method: 'PUT',
    onSuccess: (res: { post: IFeedPost }) => {
      setComment('');
      setExtraAssetsState([]);
      setIsModalOpen(false);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setComment('');
      setExtraAssetsState([]);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (comment.trim()) {
      const formData = new FormData();
      formData.append('comment', comment);
      for (let i = 0; i < extraAssetsState.length; i++) {
        formData.append('commentimage', extraAssetsState[i]);
      }
      commentOnPostFetch(formData);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setComment((prev) => prev + emoji);
  };

  const handleAddExtraAssets = (assetsArr: string[]) => {
    if (extraAssetsState.length + assetsArr.length > 4) {
      return;
    }
    setExtraAssetsState((prev) => [...prev, ...assetsArr]);
  };

  return (
    <Modal
      isModalOpen={isOpen}
      setIsModalOpen={setIsModalOpen}
      blackScreenClassName="bg-[rgba(10,10,20,0.5)]"
      dialogClassName="bg-black text-white max-w-lg max-w-[650px] rounded-2xl"
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex flex-col items-center h-full">
            <AvatarImage url={post.creator.profile_img} diameter="48px" />
            <div className="w-[0.5px] bg-gray-900 flex-grow mt-2 h-full min-h-[100px]"></div>
          </div>
          <div className="flex-grow">
            <div>
              <span className="font-bold mr-1">{post.creator.full_name}</span>
              <span className="font-light text-gray-500 ml-1">
                @{post.creator.username}
              </span>
              <span> · </span>
              <span className="text-sm text-gray-500 ml-1">{post.timeAgo}</span>
            </div>
            <p className="mt-2">{post.caption}</p>
            <p className="text-gray-500 mt-2 py-3 px-4">
              replying to{' '}
              <span className="font-bold text-blue-500">
                @{post.creator.username}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div>
            <AvatarImage url={user?.profile_img} diameter="48px" />
          </div>
          <div className="flex flex-col w-full">
            <TextareaAutoSize
              placeholder="Post your reply..."
              minRows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={200}
              style={{
                backgroundColor: 'black',
                outline: 'none',
                maxWidth: '100%',
                width: '100%',
                fontSize: '1rem',
                border: 'none',
                color: 'white',
                boxShadow: 'none',
              }}
            />
            <MediaAssetsPreview
              extraAssetsState={extraAssetsState}
              setExtraAssetsState={setExtraAssetsState}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <PostExtraAsset
            extraAssetsState={extraAssetsState}
            handleAddExtraAssets={handleAddExtraAssets}
            handleAddEmoji={handleAddEmoji}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-full self-end hover:bg-blue-600 transition"
            onClick={handleSubmit}
          >
            Reply
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CommentPostModal;
