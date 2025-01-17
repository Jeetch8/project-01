interface Props {
  handleGifAdd: (gif: TenorImage) => void;
  extraAssetsState: string[];
}

import GifPicker, { TenorImage, Theme } from 'gif-picker-react';
import React from 'react';
import { HiOutlineGif } from 'react-icons/hi2';
import Modal from '@/Components/Modals/Modal';

export default function GifPickerModal({
  handleGifAdd,
  extraAssetsState,
}: Props) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  return (
    <div>
      <button
        className="disabled:opacity-50 disabled:cursor-not-allowed text-xl cursor-pointer text-blue-400"
        onClick={() => setIsModalOpen(true)}
        aria-label="gif-button"
        disabled={extraAssetsState.length >= 4}
      >
        <HiOutlineGif />
      </button>
      <Modal
        aria-label="gif-picker-modal"
        isModalOpen={isModalOpen}
        dialogClassName="py-2  px-3 m-0 text-black w-fit"
        setIsModalOpen={setIsModalOpen}
      >
        <GifPicker
          tenorApiKey={import.meta.env.VITE_TENOR_API_KEY!}
          theme={Theme.DARK}
          onGifClick={handleGifAdd}
          autoFocusSearch={true}
        />
      </Modal>
    </div>
  );
}
