import { useForm, FormProvider } from 'react-hook-form';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '@/context/GlobalContext';
import EditableField from '@/Components/Form/EditableInput';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import { IoArrowBack } from 'react-icons/io5';

const AccountInfo = () => {
  const navigate = useNavigate();
  const { user } = useGlobalContext();
  const formMethods = useForm();
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = formMethods;

  useEffect(() => {
    formMethods.reset({
      username: user?.username,
      email: user?.email,
      country: user?.location,
      gender: user?.gender,
      dateOfBirth: dayjs(user?.date_of_birth).format('YYYY-MM-DD'),
    });
  }, [user]);

  const onSubmit = (data: any) => {
    console.log(data);
    // Here you would typically send the data to your API
  };

  return (
    <div className="text-white">
      <div className="px-4 py-4 mb-3 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full transition-colors duration-200 hover:bg-gray-900"
        >
          <IoArrowBack size={18} />
        </button>
        <h1 className="text-xl font-semibold">Account information</h1>
      </div>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className="px-4">
          <EditableField
            title="Username"
            defaultValue={user?.username || ''}
            name="username"
            control={control}
          />
          <EditableField
            title="Email"
            defaultValue={user?.email || ''}
            name="email"
            control={control}
            type="email"
          />
          <EditableField
            title="Country"
            defaultValue={user?.location || ''}
            name="country"
            control={control}
          />
          <EditableField
            title="Gender"
            defaultValue={user?.gender || ''}
            name="gender"
            control={control}
          />
          <EditableField
            title="Date of Birth"
            defaultValue={dayjs(user?.date_of_birth).format('YYYY-MM-DD') || ''}
            name="dateOfBirth"
            control={control}
            type="date"
          />

          {isDirty && (
            <button
              type="submit"
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Save Changes
            </button>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export default AccountInfo;
