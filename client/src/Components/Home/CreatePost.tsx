interface Props {
  fetchHomeFeed: () => void;
}

import React, { useState } from 'react';
import AvatarImage from '@/Components/Global/AvatarImage';
import { IoImageOutline } from 'react-icons/io5';
import { useFetch } from '../../hooks/useFetch';
import { urlToBlobConverter } from '@/utils/url_to_blob_converter';
import { base_url } from '../../utils/base_url';
import toast from 'react-hot-toast';
import PostImages from './PostImages';
import { MdDeleteForever } from 'react-icons/md';

const CreatePost = ({ fetchHomeFeed }: Props) => {
  const [userInput, setUserInput] = useState('');
  const [userSelectedImage, setUserSelectedImage] = useState<File | null>(null);
  const [userSelectedImageBlob, setUserSelectedImageBlob] =
    useState<Blob | null>(null);
  const { doFetch } = useFetch({
    url: base_url + '/post',
    method: 'POST',
    authorized: true,
    onSuccess: () => {
      toast.success('Post created successfully');
      setUserInput('');
      setUserSelectedImage(null);
      fetchHomeFeed();
    },
  });

  const handlePostSubmit = () => {
    const formdata = new FormData();
    formdata.append('description', userInput);
    if (userSelectedImage) {
      formdata.append('image', userSelectedImage);
    }
    doFetch(formdata);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target?.files) return;
    setUserSelectedImage(e.target.files[0]);
    const blob = await urlToBlobConverter(e.target.files[0]);
    setUserSelectedImageBlob(blob);
  };

  return (
    <div className="border-b-[1px] border-zinc-700 py-3">
      <div className="">
        <div className="flex items-start gap-x-5 mx-5 py-5 px-1">
          <AvatarImage
            url={
              'https://img.freepik.com/free-vector/hand-drawn-one-line-art-illustration_23-2149279746.jpg?w=826&t=st=1715601394~exp=1715601994~hmac=8d768525d904e063a96a0c7025ee24738530d8b5493f0975347fccad297f1a76'
            }
            diameter={'55px'}
          />
          <div>
            <textarea
              rows={3}
              cols={42}
              name=""
              id=""
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="bg-black border-[1px] border-zinc-700 rounded-md outline-none w-full px-4 py-4 text-white"
            ></textarea>
          </div>
        </div>
        <div className=" px-5">
          <div className=" px-4 flex items-center justify-between border-t-[1px] border-zinc-700 pt-2">
            <div className="flex items-center gap-x-4">
              <div>
                <label htmlFor="newPostImage" className=" cursor-pointer">
                  <IoImageOutline color="#199BF0" size={21} />
                </label>
                <input
                  onChange={handleImageChange}
                  className="hidden"
                  type="file"
                  id="newPostImage"
                  accept="image/png, image/jpeg, image/jpg, image/avif"
                />
              </div>
            </div>
            <div>
              <button
                className="bg-[#199BF0] px-6 py-2 rounded-full"
                onClick={handlePostSubmit}
              >
                Post
              </button>
            </div>
          </div>

          {userSelectedImage !== null && (
            <div className="my-4 max-w-[350px] mx-auto">
              <PostImages images={[userSelectedImageBlob]} />
              <button
                className="ml-auto flex items-baseline gap-x-2 rounded-md px-5 py-2 bg-slate-400"
                onClick={() => {
                  setUserSelectedImage(null);
                  setUserSelectedImageBlob(null);
                }}
              >
                <span>Delete</span>
                <MdDeleteForever color="red" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
