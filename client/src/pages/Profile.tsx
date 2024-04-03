import React, { useEffect, useLayoutEffect, useState } from 'react';
import { IoLocationOutline, IoRepeatOutline } from 'react-icons/io5';
import { SlCalender } from 'react-icons/sl';
import EditProfileModal from '../Components/Modals/EditProfileModal';
import { twMerge } from 'tailwind-merge';
import { useFetch } from '../hooks/useFetch';
import { base_url } from '../utils/base_url';
import AvatarImage from '@/Components/Global/AvatarImage';
import Dayjs from 'dayjs';
import { IFeedPost, IUser } from '@/utils/interfaces';
import LikedPost from '@/Components/Profile/LikedPost';
import PostsCreated from '@/Components/Profile/PostsCreated';
import { PhotoProvider, PhotoView } from 'react-photo-view';

const Profile = () => {
  const [tweetsToShow, setTweetToShow] = useState('allUserTweets');
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const { doFetch: fetchMyProfile, dataRef: myProfileRef } = useFetch<{
    user: IUser;
    posts: {
      hasMore: boolean;
      nextPage: number;
      currentPage: number;
      posts: IFeedPost[];
    };
  }>({
    url: base_url + '/user/profile',
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      console.log(data);
    },
  });

  useLayoutEffect(() => {
    fetchMyProfile();
  }, []);

  return (
    <>
      <div className="w-[620px] border-x-[1px] border-gray-700 text-white sticky top-0">
        <div className="flex flex-col py-[1vh] px-[1vw] bg-black backdrop-blur-xl sticky top-0 z-50">
          <h2 className="font-bold text-[20px]">
            {myProfileRef.current?.user?.full_name}
          </h2>
          <h3 className="text-[14px] text-gray-500">
            {myProfileRef.current?.posts?.posts?.length} Tweets
          </h3>
        </div>
        <div>
          <div className="relative">
            <PhotoProvider>
              <PhotoView src={myProfileRef.current?.user?.banner_img}>
                <img
                  src={myProfileRef.current?.user?.banner_img}
                  alt="banner"
                  className={
                    'w-full h-[250px] content-center object-center cursor-pointer'
                  }
                />
              </PhotoView>
            </PhotoProvider>

            <div className="p-1 absolute top-[17vh] left-4 bg-black rounded-full">
              <PhotoProvider>
                <PhotoView src={myProfileRef.current?.user?.profile_img}>
                  <img
                    src={myProfileRef.current?.user?.profile_img}
                    alt="profile"
                    className="rounded-full w-[125px] h-[125px] cursor-pointer"
                  />
                </PhotoView>
              </PhotoProvider>
            </div>
            <div className="flex justify-end mb-[25px]">
              <button
                className="border-[1px] border-gray-700 px-5 py-2 rounded-full mt-2 mr-4"
                onClick={() => setIsOpen(true)}
              >
                Edit Profile
              </button>
            </div>
            <div className="text-[15px] leading-9 pl-[20px] pt-[0px]">
              <div className="leading-[3vh]">
                <h1 className="text-[22px] font-bold">
                  {myProfileRef.current?.user?.full_name}
                </h1>
                <h2 className="text-zinc-500">
                  @{myProfileRef.current?.user?.username}
                </h2>
              </div>
              <h2>{myProfileRef.current?.user?.bio}</h2>
              <div className="flex space-x-5 text-zinc-500">
                <h2 className="flex items-center">
                  <IoLocationOutline className="mr-2" />
                  {myProfileRef.current?.user?.location}
                </h2>
                <h2 className="flex items-center">
                  <SlCalender className="mr-2" /> Joined{' '}
                  {`${Dayjs(myProfileRef.current?.user?.signup_date).format('MMM')} ${Dayjs(myProfileRef.current?.user?.signup_date).format('YYYY')}`}
                </h2>
              </div>
              <div className="flex space-x-6 text-[15px]">
                <h2>
                  <span className="font-semibold">
                    {myProfileRef.current?.user?.following?.length || 0}
                  </span>{' '}
                  <span className="text-zinc-500">Following</span>
                </h2>
                <h2>
                  <span className="font-semibold">
                    {myProfileRef.current?.user?.followers?.length || 0}
                  </span>{' '}
                  <span className="text-zinc-500">Followers</span>
                </h2>
              </div>
            </div>
            <div className="border-b-[1px] border-gray-700 mt-4">
              <div className="flex font-medium">
                <div
                  className={
                    'w-[200px] pt-[15px] cursor-pointer text-gray-500 hover:bg-zinc-800 group duration-200 w-full'
                  }
                  onClick={() => setTweetToShow('allUserTweets')}
                >
                  <p
                    className={twMerge(
                      'border-b-[3px] rounded-sm pb-[2vh] border-transparent w-fit mx-auto duration-200',
                      tweetsToShow === 'allUserTweets' && 'border-blue-400'
                    )}
                  >
                    Posts
                  </p>
                </div>
                <div
                  className={
                    'pt-[15px] cursor-pointer text-gray-500 hover:bg-zinc-800 group duration-200 w-full'
                  }
                  onClick={() => setTweetToShow('likedTweets')}
                >
                  <p
                    className={twMerge(
                      'border-b-[3px] rounded-sm pb-[2vh] border-transparent w-fit mx-auto duration-200',
                      tweetsToShow === 'likedTweets' && 'border-blue-400'
                    )}
                  >
                    Likes
                  </p>
                </div>
              </div>
            </div>
            <div className="text-white">
              {tweetsToShow === 'allUserTweets' && (
                <PostsCreated
                  posts={myProfileRef.current?.posts?.posts}
                  hasMore={myProfileRef.current?.posts?.hasMore}
                  nextPage={myProfileRef.current?.posts?.nextPage}
                  currentPage={myProfileRef.current?.posts?.currentPage}
                />
              )}
              {tweetsToShow === 'likedTweets' && <LikedPost />}
            </div>
          </div>
        </div>
      </div>
      <EditProfileModal
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        user={myProfileRef.current?.user}
        fetchMyProfile={fetchMyProfile}
      />
    </>
  );
};

export default Profile;
