import 'react-circular-progressbar/dist/styles.css';
import { useState } from 'react';
import TextareaAutoSize from 'react-textarea-autosize';
import { CircularProgressbar } from 'react-circular-progressbar';
import { CiCirclePlus } from 'react-icons/ci';
import AudienceSelection from './AudienceSelection';
import MediaAssetsPreview from './ExtraAssets/MediaAssetsPreview';
import { MoonLoader } from 'react-spinners';
import AvatarImage from '@/Components/Global/AvatarImage';
import { useGlobalContext } from '@/context/GlobalContext';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { toast } from 'react-hot-toast';
import PostExtraAsset from './PostExtraAsset';

export default function CreateNewPostBox() {
  const { user } = useGlobalContext();
  const [inputText, setInputText] = useState('');
  const [extraAssetsState, setExtraAssetsState] = useState<string[]>([]);
  const { doFetch, fetchState } = useFetch({
    url: base_url + '/post/create',
    method: 'POST',
    authorized: true,
    onSuccess: () => {
      setInputText('');
      setExtraAssetsState([]);
    },
    onError: (err) => {
      if (!Array.isArray(err.message)) toast.error(err.message);
    },
  });

  const handleAddExtraAssets = (assestsArr: string[]) => {
    if (extraAssetsState.length + assestsArr.length > 4) {
      return;
    }
    setExtraAssetsState((prev) => [...prev, ...assestsArr]);
  };

  const handleCreateNewPost = async () => {
    const formData = new FormData();
    for (let i = 0; i < extraAssetsState.length; i++) {
      formData.append('postimage', extraAssetsState[i]);
    }
    formData.append('caption', inputText);
    doFetch(formData);
  };

  return (
    <div className="flex w-[600px] space-x-3 px-4 mt-4 border-zinc-600 border-b-[0.5px] text-white">
      <div>
        <AvatarImage diameter="50px" url={user?.profile_img} />
      </div>
      <div className="w-full">
        <AudienceSelection />
        <TextareaAutoSize
          placeholder={`What's happening?`}
          minRows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          color="white"
          maxLength={200}
          style={{
            backgroundColor: 'black',
            outline: 'none',
            maxWidth: '600px',
            width: '100%',
            fontSize: '1.5rem',
            border: 'none',
            boxShadow: 'none',
          }}
        />
        <MediaAssetsPreview
          extraAssetsState={extraAssetsState}
          setExtraAssetsState={setExtraAssetsState}
        />
        <div className=" border-t-[0.1px] border-zinc-700 py-2 px-1 flex justify-between items-center relative">
          <PostExtraAsset
            extraAssetsState={extraAssetsState}
            handleAddExtraAssets={handleAddExtraAssets}
          />
          <div className="flex items-center">
            <span className="w-[25px]">
              <CircularProgressbar
                value={inputText.length}
                maxValue={200}
                strokeWidth={10}
                className="text-red-400"
              />
            </span>
            <span className="h-[35px] ml-3 mr-2 bg-zinc-500 w-[0.5px]"></span>
            <CiCirclePlus className="text-3xl cursor-pointer text-blue-400" />
            <button
              className="bg-[#199BF0] mx-2 py-1 px-4 rounded-2xl font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              disabled={fetchState === 'loading' || inputText.length === 0}
              onClick={handleCreateNewPost}
            >
              {fetchState === 'loading' ? (
                <MoonLoader color="#fff" size={20} />
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
