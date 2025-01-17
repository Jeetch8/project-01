import React from 'react';
import 'react-photo-view/dist/react-photo-view.css';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { twMerge } from 'tailwind-merge';
import { IoMdClose } from 'react-icons/io';

export default function ExtraAssestsBox({
  extraAssetsState,
  setExtraAssetsState,
}: {
  extraAssetsState: string[];
  setExtraAssetsState: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const removeImagefromState = (index: number) => {
    setExtraAssetsState((prev) => prev.filter((_, i) => i !== index));
  };

  if (extraAssetsState.length === 0) return null;

  return (
    <PhotoProvider className="">
      <div
        className={twMerge(
          'grid grid-cols-2 grid-rows-1 gap-3 w-full h-[320px]',
          extraAssetsState.length <= 2 ? 'grid-rows-1' : 'grid-rows-2',
          extraAssetsState.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        )}
      >
        {extraAssetsState.map((item, index) => (
          <div
            className={twMerge(
              'relative',
              index === 0 && extraAssetsState.length === 3 ? 'row-span-2' : ''
            )}
            key={index}
          >
            <div className="absolute flex justify-between items-center w-full mt-2">
              <button className="text-white bg-[rgba(0,0,0,0.8)] rounded-2xl ml-4 px-4 py-1 font-semibold">
                Edit
              </button>
              <button
                className="text-white bg-[rgba(0,0,0,0.8)] rounded-full mr-3 w-7 h-7 flex justify-center items-center px-[0.5px] py-[0.5px] cursor-pointer"
                onClick={() => removeImagefromState(index)}
              >
                <IoMdClose />
              </button>
            </div>
            <PhotoView key={index} src={item}>
              <img
                key={index}
                src={item}
                alt=""
                className={
                  'w-full max-h-[320px] h-full object-cover rounded-xl content-center object-center cursor-pointer'
                }
              />
            </PhotoView>
          </div>
        ))}
      </div>
    </PhotoProvider>
  );
}
