interface Props {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

import { useState } from 'react';
import UsersList from './UsersList';
import { IUserWithoutPassword, RoomDocumentType } from '../../types';
import { IoClose } from 'react-icons/io5';
import { useFetch } from '../../../hooks/useFetch';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../../context/GlobalContext';
import { base_url } from '@/utils/base_url';

const CreateGroup = ({ setIsModalOpen }: Props) => {
  const { fetchUserProfileMe } = useGlobalContext();
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState<IUserWithoutPassword[]>(
    []
  );

  const { doFetch: fetchCreateNewGroup, fetchState: fetchCreateNewGroupState } =
    useFetch<{ room: RoomDocumentType }>({
      authorized: true,
      method: 'POST',
      url: base_url + '/room',
      onSuccess: async (data) => {
        await fetchUserProfileMe();
        setIsModalOpen(false);
        navigate('/chat/' + data.room._id);
      },
    });

  const handleOnUserClick = (user: IUserWithoutPassword) => {
    const doesUserExist = selectedUsers.find((el) => el._id === user._id);
    if (!doesUserExist) setSelectedUsers((prev) => [...prev, user]);
  };

  const deselectUser = (user: IUserWithoutPassword) => {
    const filteredUsers = selectedUsers.filter((el) => el._id !== user._id);
    setSelectedUsers(filteredUsers);
  };

  const handleOnSubmit = async () => {
    if (selectedUsers.length > 0) {
      await fetchCreateNewGroup({ participants: selectedUsers, type: 'group' });
    }
  };

  return (
    <>
      <div className="max-h-[72px] overflow-y-scroll mb-2">
        <div className="flex flex-wrap gap-x-2 gap-y-2">
          {selectedUsers.map((el) => [
            <div
              key={el._id}
              className="flex border-[1px] p-[1px] items-center rounded-full w-fit pr-2"
            >
              <div className="avatar">
                <div className="w-6 rounded-full">
                  <img src={el.profilePic} width={25} height={25} alt="" />
                </div>
              </div>
              <span className="text-sm ml-2">{el.name}</span>
              <span
                className="ml-2 hover:bg-slate-900 cursor-pointer rounded-full"
                onClick={() => deselectUser(el)}
              >
                <IoClose size={15} />
              </span>
            </div>,
          ])}
        </div>
      </div>
      <UsersList handleOnUserClick={handleOnUserClick} />
      <div className="flex justify-end">
        <button
          className="px-6 py-2 bg-gray-900 rounded-full hover:bg-gray-950 disabled:bg-gray-500 disabled:cursor-not-allowed duration-200"
          onClick={handleOnSubmit}
          disabled={selectedUsers.length === 0}
        >
          {fetchCreateNewGroupState === 'loading' ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            'Create'
          )}
        </button>
      </div>
    </>
  );
};

export default CreateGroup;
