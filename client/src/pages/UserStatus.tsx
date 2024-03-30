import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Post from '@/Components/Home/Post';
import AvatarImage from '@/Components/Global/AvatarImage';
import { useGlobalContext } from '@/context/GlobalContext';
import { useFetch, FetchStates } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { RingLoader } from 'react-spinners';
import { IPostPage } from '@/utils/interfaces';
import { IoArrowBack } from 'react-icons/io5';
import TextareaAutoSize from 'react-textarea-autosize';
import PostExtraAsset from '@/Components/Home/CreateNewPost/PostExtraAsset';
import MediaAssetsPreview from '@/Components/Home/CreateNewPost/ExtraAssets/MediaAssetsPreview';
import { twMerge } from 'tailwind-merge';

const UserStatus: React.FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ username: string; postId: string }>();
  const [reply, setReply] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [extraAssetsState, setExtraAssetsState] = useState<string[]>([]);
  const { user } = useGlobalContext();
  const replyBoxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    doFetch: fetchPost,
    fetchState,
    dataRef,
  } = useFetch<{ post: IPostPage }>({
    url: base_url + `/post/${postId}`,
    authorized: true,
    method: 'GET',
    onSuccess: (res) => {
      console.log(res, 'userstatus');
    },
  });

  const { doFetch: replyToPost } = useFetch({
    url: base_url + `/post/${postId}/comment`,
    authorized: true,
    method: 'PUT',
    onSuccess: () => {
      setReply('');
      fetchPost();
    },
  });

  React.useEffect(() => {
    fetchPost();
  }, [postId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && isExpanded) {
          setIsExpanded(false);
          textareaRef.current?.blur(); // Remove focus from textarea
        }
      },
      { threshold: 0 }
    );

    if (replyBoxRef.current) {
      observer.observe(replyBoxRef.current);
    }

    return () => {
      if (replyBoxRef.current) {
        observer.unobserve(replyBoxRef.current);
      }
    };
  }, [isExpanded]);

  const handleReply = () => {
    if (reply.trim()) {
      replyToPost({ comment: reply, media: extraAssetsState });
    }
  };

  const handleAddExtraAssets = (assetsArr: string[]) => {
    if (extraAssetsState.length + assetsArr.length > 4) {
      return;
    }
    setExtraAssetsState((prev) => [...prev, ...assetsArr]);
  };

  if (fetchState === FetchStates.LOADING) {
    return (
      <div className="flex justify-center items-center h-screen text-white max-w-[600px] w-[600px]">
        <RingLoader color="#1DA1F2" size={50} />
      </div>
    );
  }

  if (fetchState === FetchStates.ERROR || !dataRef.current) {
    return <div className="text-white">Error loading post</div>;
  }

  return (
    <div className="mx-auto text-white max-w-[600px] w-full border-r-[2px] border-zinc-900">
      <nav className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm px-4 py-3 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full transition-colors duration-200 hover:bg-gray-900"
        >
          <IoArrowBack size={24} />
        </button>
        <h1 className="text-2xl font-bold">Post</h1>
      </nav>

      <Post post={dataRef.current.post} />
      <div
        ref={replyBoxRef}
        className={twMerge(
          'border-b-[2px] border-zinc-900 px-4 py-5',
          isExpanded && 'py-2'
        )}
      >
        <div className="flex items-start space-x-3">
          <AvatarImage url={user?.profile_img} diameter="48px" />
          <div className="flex-grow">
            <div className="flex items-center">
              <TextareaAutoSize
                ref={textareaRef} // Add this line
                onClick={() => setIsExpanded(true)}
                placeholder="Post your reply..."
                minRows={isExpanded ? 3 : 1}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="w-full bg-transparent text-white text-lg"
                style={{
                  fontSize: '1.125rem',
                  outline: 'none',
                  border: 'none',
                  boxShadow: 'none',
                }}
              />
              {!isExpanded && (
                <button
                  onClick={handleReply}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                >
                  Reply
                </button>
              )}
            </div>
            <MediaAssetsPreview
              extraAssetsState={extraAssetsState}
              setExtraAssetsState={setExtraAssetsState}
            />
            {isExpanded && (
              <div className="flex justify-between items-center mt-3">
                <PostExtraAsset
                  extraAssetsState={extraAssetsState}
                  handleAddExtraAssets={handleAddExtraAssets}
                  showImage={true}
                  showGif={true}
                  showEmoji={true}
                  showList={false}
                  showCalendar={false}
                  showLocation={true}
                />
                <button
                  onClick={handleReply}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                >
                  Reply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-[600px]">
        {dataRef.current.post.comments.map((comment: IPostPage) => (
          <Post key={comment.id} post={comment} outerClassName="" />
        ))}
      </div>
    </div>
  );
};

export default UserStatus;
