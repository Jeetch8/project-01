import { useForm, FormProvider } from 'react-hook-form';
import Modal from './Modal';
import { useFetch } from '@/hooks/useFetch';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { TbCameraPlus } from 'react-icons/tb';
import { Button } from '../Global/Button';
import dayjs from 'dayjs';
import { FetchStates } from '@/hooks/useFetch';
import { MoonLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { base_url } from '@/utils/base_url';
import { useGlobalContext } from '@/context/GlobalContext';

interface Props {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  modalIsOpen: boolean;
}

interface FormData {
  profile_img: string;
  banner_img: string;
  full_name: string;
  bio: string;
  date_of_birth: string;
}

const EditProfileModal = ({ setIsOpen, modalIsOpen }: Props) => {
  const { user, fetchMyProfile } = useGlobalContext();
  const methods = useForm<FormData>({
    defaultValues: {
      profile_img: user?.profile_img,
      banner_img: user?.banner_img,
      full_name: user?.full_name,
      bio: user?.bio,
      date_of_birth: dayjs(user?.date_of_birth).format('YYYY-MM-DD'),
    },
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    reset({
      profile_img: user?.profile_img,
      banner_img: user?.banner_img,
      full_name: user?.full_name,
      bio: user?.bio,
      date_of_birth: dayjs(user?.date_of_birth).format('YYYY-MM-DD'),
    });
  }, [user]);

  const { doFetch: updateUserProfileFetch, fetchState } = useFetch({
    url: base_url + '/user/profile',
    method: 'PUT',
    onSuccess: () => {
      fetchMyProfile();
      toast.success('Profile updated');
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    },
  });

  const onSubmit = async (data: FormData) => {
    await updateUserProfileFetch({ body: data });
  };

  const handleImageChange =
    (field: 'profile_img' | 'banner_img') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setValue(field, URL.createObjectURL(file), { shouldDirty: true });
      }
    };

  const isButtonDisabled = !isDirty || fetchState === FetchStates.LOADING;

  return (
    <Modal
      isModalOpen={modalIsOpen}
      setIsModalOpen={setIsOpen}
      header={<h2 className="font-bold text-[20px]">Edit Profile</h2>}
      dialogClassName="bg-black text-white rounded-2xl border-2 border-gray-700/30 max-w-[600px]"
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative">
            <div className="w-full h-[200px] bg-black flex justify-center items-center">
              <img
                src={watch('banner_img')}
                alt="banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute flex items-center justify-center">
                <label
                  htmlFor="bannerImgUpload"
                  className="bg-slate-700/40 rounded-full p-1 hover:bg-slate-700/60 cursor-pointer"
                >
                  <TbCameraPlus className="text-[20px]" />
                </label>
              </div>
              <input
                type="file"
                id="bannerImgUpload"
                aria-label="Banner image"
                className="hidden"
                onChange={handleImageChange('banner_img')}
              />
            </div>
            <div className="absolute top-[150px] z-50 left-4">
              <div className="relative w-fit border-2 border-black rounded-full">
                <div className="absolute flex items-center justify-center w-[120px] h-[120px]">
                  <label
                    htmlFor="profilePicUpload"
                    className="bg-slate-700/80 rounded-full p-1 hover:bg-slate-700/60 cursor-pointer"
                  >
                    <TbCameraPlus className="text-[20px]" />
                  </label>
                </div>
                <input
                  type="file"
                  id="profilePicUpload"
                  aria-label="Profile image"
                  className="hidden"
                  onChange={handleImageChange('profile_img')}
                />
                <img
                  src={watch('profile_img')}
                  alt="profile"
                  className="w-[120px] h-[120px] rounded-full"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col border-[1px] border-zinc-800 rounded-lg pt-1 mt-[90px] transition-colors duration-200 group focus-within:border-blue-500 overflow-hidden">
            <div className="text-zinc-500 text-[13px] px-2">Full Name</div>
            <input
              {...register('full_name')}
              style={{
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
              }}
              aria-label="Full Name"
              type="text"
              className="bg-transparent px-2 pb-2 text-[17px] focus:outline-none"
            />
          </div>
          <div className="flex flex-col border-[1px] border-zinc-800 rounded-lg pt-1 mt-6 transition-colors duration-200 group focus-within:border-blue-500 overflow-hidden">
            <div className="text-zinc-500 text-[13px] px-2">Bio</div>
            <textarea
              {...register('bio')}
              style={{
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
              }}
              cols={30}
              rows={3}
              aria-label="Bio"
              className="bg-transparent px-2"
            ></textarea>
          </div>
          <div className="mt-5 mb-6">
            <h2 className="text-[15px] text-gray-600">Birth date</h2>
            <input
              {...register('date_of_birth')}
              type="date"
              className="text-black text-[20px]"
              aria-label="Birth date"
            />
          </div>
          <div className="flex justify-end items-center backdrop-blur-xl">
            <Button
              type="submit"
              variant="default"
              className={`rounded-full font-medium ${
                isButtonDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100'
              }`}
              disabled={isButtonDisabled}
            >
              {fetchState === FetchStates.LOADING ? (
                <MoonLoader size={20} color="#000" aria-label="loading" />
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default EditProfileModal;
