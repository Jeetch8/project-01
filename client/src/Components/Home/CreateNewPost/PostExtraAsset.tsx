import React, { ChangeEvent, useRef, useState } from 'react';
import { IoImageOutline } from 'react-icons/io5';
import { PiListChecks } from 'react-icons/pi';
import { GrEmoji } from 'react-icons/gr';
import { LuCalendarClock } from 'react-icons/lu';
import { CiLocationOn } from 'react-icons/ci';
import EmojiPicker from 'emoji-picker-react';
import { useDetectOutsideClick } from '@/hooks/useDetectOutsideClick';
import GifPickerModal from './ExtraAssets/GifPickerModal';
import { TenorImage } from 'gif-picker-react';
import { twMerge } from 'tailwind-merge';

interface PostExtraAssetProps {
  extraAssetsState: string[];
  handleAddExtraAssets: (assets: string[]) => void;
}

const PostExtraAsset: React.FC<PostExtraAssetProps> = ({
  handleAddExtraAssets,
  extraAssetsState,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputBoxRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useDetectOutsideClick(() => {
    setShowEmojiPicker(false);
  });

  const handleImageAdd = (e: ChangeEvent<HTMLInputElement>) => {
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
    handleAddExtraAssets([gif.url]);
  };

  const handleEmojiClick = (emojiObject: any) => {
    handleAddExtraAssets([emojiObject.emoji]);
  };

  return (
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
        onChange={handleImageAdd}
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
        <EmojiPicker open={showEmojiPicker} onEmojiClick={handleEmojiClick} />
      </div>
      <LuCalendarClock className="text-xl cursor-pointer text-blue-400" />
      <CiLocationOn className="text-xl cursor-pointer text-blue-400" />
    </span>
  );
};

export default PostExtraAsset;
