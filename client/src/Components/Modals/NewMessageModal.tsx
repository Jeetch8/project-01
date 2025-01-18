import { Dispatch, SetStateAction } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from './Modal';
import { base_url } from '@/utils/base_url';
import AsyncSelect from 'react-select/async';
import { Button } from '../Global/Button';
import { useSocketContext } from '@/context/SocketContext';
import { getTokenFromLocalStorage } from '@/utils/localstorage';
import { IParticipant as IParticipantDocument } from '@/types/models';
import { IParticipant } from '@/types/socket';
import { useGlobalContext } from '@/context/GlobalContext';
import { TbCameraPlus } from 'react-icons/tb';
import { IUser } from '@/types/interfaces';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

interface UserOption extends IParticipant {
  value: string;
  label: string;
}

interface FormData {
  selectedUsers: UserOption[];
  room_name: string;
  room_img: string;
}

const NewMessageModal = ({ isModalOpen, setIsModalOpen }: Props) => {
  const { createRoom, socketUser } = useSocketContext();
  const { user } = useGlobalContext();
  const {
    control,
    handleSubmit,
    formState: { isValid },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      selectedUsers: [],
      room_name: '',
      room_img: '',
    },
    mode: 'onChange',
  });

  const selectedUsers = watch('selectedUsers');
  const showGroupFields = selectedUsers.length > 1;

  const promiseOptions = async (inputValue: string): Promise<UserOption[]> => {
    if (inputValue.length < 2) {
      return Promise.resolve([]);
    }
    return await fetch(`${base_url}/user?query=${inputValue}`, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => data.users)
      .then((users: Omit<IParticipantDocument, 'participatedRooms' | 'id'>[]) =>
        users.map((user) => {
          const id = user.userid;
          return {
            value: id,
            label: user.name,
            id,
            profile_img: user.profile_img,
            name: user.name,
            email: user.email,
            userid: user.userid,
          };
        })
      );
  };

  const onSubmit = async (data: FormData) => {
    console.log(data.selectedUsers, 'selectedUsers', socketUser);
    if (!user || !socketUser) return;
    await createRoom({
      participants: [...data.selectedUsers, socketUser],
      room_name: data.room_name,
      room_img: data.room_img,
    });
    setIsModalOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('room_img', URL.createObjectURL(file), { shouldDirty: true });
    }
  };

  return (
    <Modal
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      header={<h3 className="text-2xl font-semibold">New Message</h3>}
      dialogClassName="bg-black text-white rounded-2xl"
      blackScreenClassName="bg-[rgba(25,155,240,0.1)]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="min-h-[200px]">
        <Controller
          name="selectedUsers"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <AsyncSelect
              {...field}
              isMulti
              autoFocus
              cacheOptions
              placeholder="Search"
              defaultOptions
              openMenuOnClick={false}
              className="text-black"
              components={{
                MultiValueLabel: ({ data }) => (
                  <div className="flex items-center px-2 py-1">
                    <img
                      src={data.profile_img}
                      alt={data.label}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span>{data.label}</span>
                  </div>
                ),
              }}
              loadOptions={promiseOptions}
            />
          )}
        />

        {showGroupFields && (
          <div className="mt-4">
            <Controller
              name="room_name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Group Name"
                  className="w-full p-2 rounded-md text-black"
                />
              )}
            />

            <div className="mt-4 relative">
              <Controller
                name="room_img"
                control={control}
                render={({ field }) => (
                  <div className="relative w-24 h-24 border-2 border-gray-300 rounded-full overflow-hidden">
                    {field.value ? (
                      <img
                        src={field.value}
                        alt="Room"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <TbCameraPlus className="text-3xl text-gray-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      id="roomImgUpload"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="roomImgUpload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <TbCameraPlus className="text-3xl text-white" />
                    </label>
                  </div>
                )}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            className="rounded-full"
            size="lg"
            disabled={!isValid}
          >
            Next
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewMessageModal;
