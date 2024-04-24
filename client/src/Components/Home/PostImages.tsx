interface Props {
  media: IPostMedia[];
}

import 'react-photo-view/dist/react-photo-view.css';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { twMerge } from 'tailwind-merge';
import { IPostMedia } from '@/utils/interfaces';

export default function PostImages({ media }: Props) {
  if (media.length === 0) return null;

  return (
    <PhotoProvider>
      <div
        className={twMerge(
          'grid grid-cols-2 grid-rows-1 gap-3 w-full h-[320px] mb-6',
          media.length <= 2 ? 'grid-rows-1' : 'grid-rows-2',
          media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        )}
      >
        {media.map((item, index) => (
          <div
            className={twMerge(
              'relative',
              index === 0 && media.length === 3 ? 'row-span-2' : ''
            )}
            key={index}
          >
            {/* <div className="absolute flex justify-between items-center w-full mt-2">
              <button className="text-white bg-[rgba(0,0,0,0.8)] rounded-2xl ml-4 px-4 py-1 font-semibold">
                Edit
              </button>
              <button
                className="text-white bg-[rgba(0,0,0,0.8)] rounded-full mr-3 w-7 h-7 flex justify-center items-center px-[0.5px] py-[0.5px] cursor-pointer"
                onClick={() => removeImagefromState(index)}
              >
                <IoMdClose />
              </button>
            </div> */}
            <PhotoView key={index} src={item.original_media_url}>
              <img
                key={index}
                src={item.original_media_url}
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
