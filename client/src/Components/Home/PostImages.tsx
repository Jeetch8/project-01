// import { IPostMedia } from '@/utils/interfaces';
// import { twMerge } from 'tailwind-merge';

// const PostImages = ({ media }: Props) => {
//   console.log(media);
//   return (
//     <div
//       className={twMerge(
//         'grid gap-1 h-[300px]',
//         media.length > 1 && 'grid-cols-2'
//       )}
//     >
//       {media.map((el, ind) => {
//         if (ind === 0 && media.length === 3)
//           return (
//             <div
//               key={ind}
//               className="row-span-2"
//               style={{
//                 backgroundImage: `url(${el.original_media_url})`,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//                 backgroundRepeat: 'no-repeat',
//               }}
//             ></div>
//           );
//         return <img src={el.toString()} key={ind} alt="" />;
//       })}
//     </div>
//   );
// };

// export default PostImages;

interface Props {
  // images: (string | Blob)[];
  media: IPostMedia[];
}

import React, { useState } from 'react';
// import ImgsViewer from "react-images-viewer";
import 'react-photo-view/dist/react-photo-view.css';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { twMerge } from 'tailwind-merge';
import { IoMdClose } from 'react-icons/io';
import { IPostMedia } from '@/utils/interfaces';

export default function PostImages({ media }: Props) {
  if (media.length === 0) return null;

  return (
    <PhotoProvider className="">
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
