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

export interface PostExtraAssetProps {
  extraAssetsState: string[];
  handleAddExtraAssets: (assets: string[]) => void;
  handleAddEmoji: (emoji: string) => void;
  showImage?: boolean;
  showGif?: boolean;
  showList?: boolean;
  showEmoji?: boolean;
  showCalendar?: boolean;
  showLocation?: boolean;
}

const PostExtraAsset: React.FC<PostExtraAssetProps> = ({
  handleAddExtraAssets,
  handleAddEmoji, // New prop
  extraAssetsState,
  showImage = true,
  showGif = true,
  showList = true,
  showEmoji = true,
  showCalendar = true,
  showLocation = true,
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
    handleAddEmoji(emojiObject.emoji); // Use the new handler
    setShowEmojiPicker(false); // Close the emoji picker after selection
  };

  if (
    !showImage &&
    !showGif &&
    !showList &&
    !showEmoji &&
    !showCalendar &&
    !showLocation
  ) {
    return null;
  }

  return (
    <span className="flex space-x-2">
      {showImage && (
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
      )}
      {showImage && (
        <input
          ref={inputBoxRef}
          multiple
          disabled={extraAssetsState.length >= 4}
          className="hidden"
          aria-label="imageInput"
          type="file"
          accept="image/*"
          onChange={handleImageAdd}
          id="imageInput"
        />
      )}
      {showGif && (
        <GifPickerModal
          handleGifAdd={handleGifAdd}
          extraAssetsState={extraAssetsState}
        />
      )}
      {showList && (
        <PiListChecks
          className="text-xl cursor-pointer text-blue-400"
          aria-label="poll-button"
        />
      )}
      {showEmoji && (
        <>
          <GrEmoji
            className="text-xl cursor-pointer text-blue-400"
            aria-label="emoji-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
          <div ref={emojiPickerRef} style={{ position: 'absolute' }}>
            <EmojiPicker
              className="z-50"
              aria-label="emoji-picker"
              open={showEmojiPicker}
              onEmojiClick={handleEmojiClick}
            />
          </div>
        </>
      )}
      {showCalendar && (
        <LuCalendarClock
          className="text-xl cursor-pointer text-blue-400"
          aria-label="calendar-button"
        />
      )}
      {showLocation && (
        <CiLocationOn
          className="text-xl cursor-pointer text-blue-400"
          aria-label="location-button"
        />
      )}
    </span>
  );
};

export default PostExtraAsset;
