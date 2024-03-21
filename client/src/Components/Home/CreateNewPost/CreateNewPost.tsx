'use client';

// Methods to get gifs
// gf.random
// gf.search
import 'react-circular-progressbar/dist/styles.css';
import React, { ChangeEvent, useRef, useState } from 'react';
import TextareaAutoSize from 'react-textarea-autosize';
import { IoImageOutline } from 'react-icons/io5';
import { HiOutlineGif } from 'react-icons/hi2';
import { PiListChecks } from 'react-icons/pi';
import { GrEmoji } from 'react-icons/gr';
import { LuCalendarClock } from 'react-icons/lu';
import { CiLocationOn } from 'react-icons/ci';
import { CircularProgressbar } from 'react-circular-progressbar';
import { CiCirclePlus } from 'react-icons/ci';
import EmojiPicker from 'emoji-picker-react';
import WhoCanReply from './WhoCanReply';
import AudienceSelection from './AudienceSelection';
import TagUsersDropDown from './TagUsersDropDown';
import ContentEditableBox from './ContentEditableBox';
import { useDetectOutsideClick } from '@/hooks/useDetectOutsideClick';
import ExtraAssestsBox from './ExtraAssets/ExtraAssestsBox';
import { twMerge } from 'tailwind-merge';
import GifPickerModal from './ExtraAssets/GifPickerModal';
import GifPicker, { TenorImage, Theme } from 'gif-picker-react';
import { MoonLoader } from 'react-spinners';
import AvatarImage from '@/Components/Global/AvatarImage';
import { useGlobalContext } from '@/context/GlobalContext';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { toast } from 'react-hot-toast';

export default function CreateNewPostBox() {
  const { user } = useGlobalContext();
  const [inputText, setInputText] = useState('');
  const inputBoxRef = useRef(null);
  const [audienceDropdown, setAudienceDropdown] = useState(false);
  const [replyAllowedDropdown, setReplyAllowedDropdown] = useState(false);
  const [userTaggingDropdown, setUserTaggingDropdown] = useState(false);
  const userTagsDropdownRef = useRef<HTMLDivElement>(null);
  const testingDivRef = useRef(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useDetectOutsideClick(() => {
    setShowEmojiPicker(false);
  });
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

  function handleEmojiClick(emoji: any) {
    if (!divRef.current) return;
    divRef.current.innerHTML += emoji.emoji;
  }

  const handleAddExtraAssets = (assestsArr: string[]) => {
    if (extraAssetsState.length + assestsArr.length > 4) {
      return;
    }
    setExtraAssetsState((prev) => [...prev, ...assestsArr]);
  };

  const handlleImageAdd = (e: ChangeEvent<HTMLInputElement>) => {
    if (inputText.length === 0) return;
    if (e.target.files && e.target.files.length > 0) {
      let tempArr: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const imgSrc = URL.createObjectURL(e.target.files[i]);
        tempArr.push(imgSrc);
      }
      handleAddExtraAssets(tempArr);
    }
  };

  const handleGifAdd = (gif: TenorImage) => {
    console.log(gif);
    handleAddExtraAssets([gif.url]);
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
        {/* <ContentEditableBox divRef={divRef} /> */}
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
          }}
        />
        <ExtraAssestsBox
          extraAssetsState={extraAssetsState}
          setExtraAssetsState={setExtraAssetsState}
        />
        {/* <div
          className="relative border-2 border-blue-400 rounded-xl text-blue-400 w-fit px-4 py-1 text-sm mt-4"
          ref={testingDivRef}
        >
          <span>Testing Div</span>
          <TagUsersDropDown />
        </div> */}
        <div className=" border-t-[0.1px] border-zinc-700 py-2 px-1 flex justify-between items-center relative">
          <span className="flex space-x-2">
            <label
              htmlFor="imageInput"
              className="disabled:cursor-not-allowed disabled:opacity-50 text-blue-400 text-xl"
            >
              <IoImageOutline
                className={twMerge(
                  extraAssetsState.length >= 4
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer'
                )}
              />
            </label>
            <input
              ref={inputBoxRef}
              multiple
              disabled={extraAssetsState.length >= 4}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={handlleImageAdd}
              id="imageInput"
            />
            <GifPickerModal
              handleGifAdd={handleGifAdd}
              extraAssetsState={extraAssetsState}
            />
            <PiListChecks className="text-xl cursor-pointer text-blue-400" />
            <GrEmoji
              className="text-xl cursor-pointer text-blue-400"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            <div ref={emojiPickerRef} style={{ position: 'absolute' }}>
              <EmojiPicker
                open={showEmojiPicker}
                onEmojiClick={handleEmojiClick}
              />
            </div>
            <LuCalendarClock className="text-xl cursor-pointer text-blue-400" />
            <CiLocationOn className="text-xl cursor-pointer text-blue-400" />
          </span>
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
