import { useEffect, useRef, useState } from 'react';
import { useFetch } from '../../../hooks/useFetch';
import { IoSearchOutline } from 'react-icons/io5';
import { base_url } from '@/utils/base_url';
import { IUser } from '@/utils/interfaces';
import { CircleLoader } from 'react-spinners';

interface Props {
  handleOnUserClick: (user: IUser) => void;
}

const UsersList = ({ handleOnUserClick }: Props) => {
  const [userInput, setUserInput] = useState('');
  const [usersList, setUsersList] = useState<IUser[]>([]);
  const inputRef = useRef<HTMLInputElement | null>();
  const { doFetch: fetchMatchingUsers, fetchState } = useFetch<{
    users: IUser[];
  }>({
    authorized: true,
    method: 'GET',
    url:
      base_url + '/user' + (userInput.length > 0 ? '?search=' + userInput : ''),
    onSuccess(data) {
      setUsersList(data.users);
    },
  });
  let timeOutId: NodeJS.Timeout;
  useEffect(() => {
    clearTimeout(timeOutId as NodeJS.Timeout);
    timeOutId = setTimeout(() => {
      if (userInput) fetchMatchingUsers();
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [userInput]);

  useEffect(() => {
    fetchMatchingUsers();
    inputRef.current?.focus();
  }, []);

  return (
    <div className="">
      <div className="flex items-center gap-x-2 py-2 border-t-[1px] border-b-[1px] border-t-white border-b-white">
        <IoSearchOutline className="ml-2 text-xl" color="gray" />
        <input
          onChange={(e) => setUserInput(e.target.value)}
          value={userInput}
          type="text"
          ref={inputRef}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
          }}
          className="w-full bg-transparent outline-none"
        />
      </div>
      {fetchState === 'loading' && (
        <div className="flex items-center justify-center my-10">
          <CircleLoader />
        </div>
      )}
      <div className="mt-3 overflow-y-scroll max-h-[250px] h-full mb-2 no-scroll-container">
        {usersList.length > 0 &&
          usersList.map((el) => {
            const { full_name, email, profile_img } = el;

            return (
              <div
                onClick={() => handleOnUserClick(el)}
                className="w-full hover:bg-slate-800 duration-150 rounded-md select-none cursor-pointer"
                key={el.id}
              >
                <div className="flex flex-row items-center p-2 gap-x-3 hover:bg-stone-900 rounded-lg">
                  <div className="flex flex-col">
                    <img
                      src={profile_img}
                      alt="profile"
                      className="rounded-full w-10 h-10"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-lg font-bold">{full_name}</div>
                    <div className="text-sm">{email}</div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default UsersList;
