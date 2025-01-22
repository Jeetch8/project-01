import React, { useEffect, useState } from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { SlCalender } from 'react-icons/sl';
import EditProfileModal from '../Components/Modals/EditProfileModal';
import { twMerge } from 'tailwind-merge';
import Dayjs from 'dayjs';
import LikedPost from '@/Components/Profile/LikedPost';
import PostsCreated from '@/Components/Profile/PostsCreated';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import PostMedia from '@/Components/Profile/CreatedPostsMedia';
import { IGlobalContextUser, useGlobalContext } from '@/context/GlobalContext';
import AvatarTemplate from '@/assets/AvatarTemplate.png';
import BlackScreen from '@/assets/black-screen_39.png';
import { useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import RingLoader from 'react-spinners/RingLoader';
import FollowBtn from '@/Components/Global/FollowBtn';

const Profile = () => {
  const [tweetsToShow, setTweetToShow] = useState('allUserTweets');
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const { user: globalUser } = useGlobalContext();
  const { username: paramsUserName } = useParams();
  const [user, setUser] = useState<IGlobalContextUser | null>(null);

  const { fetchState, doFetch, dataRef } = useFetch<{
    user: IGlobalContextUser;
    doesFollow: boolean;
  }>({
    url: `${base_url}/user/${paramsUserName}`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setUser(data.user);
    },
    onError() {
      console.log('Here');
    },
  });

  useEffect(() => {
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsUserName]);

  return (
    <>
      <div className="w-[620px] border-x-[1px] border-gray-700 text-white">
        <div className="flex justify-between py-3 px-5 sticky top-0 z-50 bg-[rgba(0,0,0,0.8)] backdrop-blur-md">
          <h2 className="font-bold text-[20px]">{user?.full_name}</h2>
          <div className="mr-2">
            {fetchState == 'loading' && (
              <RingLoader color="#1d9bf0" size={20} />
            )}
          </div>
        </div>
        <div>
          <div className="relative">
            <PhotoProvider>
              <PhotoView src={user?.banner_img ?? BlackScreen}>
                <div className="h-[250px] overflow-hidden">
                  <img
                    src={user?.banner_img ?? BlackScreen}
                    alt="banner"
                    className={
                      'w-full content-center object-center cursor-pointer'
                    }
                  />
                </div>
              </PhotoView>
            </PhotoProvider>

            <div className="p-1 absolute top-[17vh] left-4 bg-black rounded-full">
              <PhotoProvider>
                <PhotoView src={user?.profile_img ?? AvatarTemplate}>
                  <img
                    src={user?.profile_img ?? AvatarTemplate}
                    alt="profile"
                    className="rounded-full w-[125px] h-[125px] cursor-pointer"
                  />
                </PhotoView>
              </PhotoProvider>
            </div>
            <div className="flex justify-end mb-[5px] mt-2 mr-4">
              {globalUser?.id === user?.id ? (
                <button
                  className="border-2 border-gray-700 px-5 py-2 rounded-full"
                  onClick={() => setIsOpen(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <FollowBtn
                  userId={user?.id as string}
                  defaultIsFollowing={dataRef.current?.doesFollow ?? false}
                />
              )}
            </div>
            <div className="text-[15px] leading-9 pl-[20px] pt-[0px]">
              <div className="leading-[3vh]">
                <h1 className="text-[22px] font-bold">{user?.full_name}</h1>
                <h2 className="text-zinc-500">@{user?.username}</h2>
              </div>
              <h2>{user?.bio}</h2>
              <div className="flex space-x-5 text-zinc-500">
                <h2 className="flex items-center">
                  <IoLocationOutline className="mr-2" />
                  {user?.location}
                </h2>
                <h2 className="flex items-center">
                  <SlCalender className="mr-2" /> Joined{' '}
                  {`${Dayjs(user?.signup_date).format('MMM')} ${Dayjs(
                    user?.signup_date
                  ).format('YYYY')}`}
                </h2>
              </div>
              <div className="flex space-x-6 text-[15px]">
                <h2>
                  <span className="font-semibold">
                    {user?.following_count || 0}
                  </span>{' '}
                  <span className="text-zinc-500">Following</span>
                </h2>
                <h2>
                  <span className="font-semibold">
                    {user?.followers_count || 0}
                  </span>{' '}
                  <span className="text-zinc-500">Followers</span>
                </h2>
              </div>
            </div>
            <div className="border-b-[1px] border-gray-700 mt-4">
              <div className="flex font-medium">
                <div
                  className={
                    'pt-[15px] cursor-pointer text-gray-500 hover:bg-zinc-800 group duration-200 w-full'
                  }
                  onClick={() => setTweetToShow('allUserTweets')}
                >
                  <p
                    className={twMerge(
                      'border-b-[3px] rounded-sm pb-[2vh] border-transparent w-fit mx-auto duration-200',
                      tweetsToShow === 'allUserTweets' &&
                        'border-blue-400 text-white'
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
                      tweetsToShow === 'likedTweets' &&
                        'border-blue-400 text-white'
                    )}
                  >
                    Likes
                  </p>
                </div>
                <div
                  className={
                    'pt-[15px] cursor-pointer text-gray-500 hover:bg-zinc-800 group duration-200 w-full'
                  }
                  onClick={() => setTweetToShow('media')}
                >
                  <p
                    className={twMerge(
                      'border-b-[3px] rounded-sm pb-[2vh] border-transparent w-fit mx-auto duration-200',
                      tweetsToShow === 'media' && 'border-blue-400 text-white'
                    )}
                  >
                    Media
                  </p>
                </div>
              </div>
            </div>
            <div className="text-white">
              {tweetsToShow === 'allUserTweets' && <PostsCreated />}
              {tweetsToShow === 'likedTweets' && <LikedPost />}
              {tweetsToShow === 'media' && (
                <PostMedia url={`${base_url}/user/${paramsUserName}/media`} />
              )}
            </div>
          </div>
        </div>
      </div>
      <EditProfileModal modalIsOpen={modalIsOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Profile;
