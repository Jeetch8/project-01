import { registerFormDefaultValues } from '@/pages/Register';
import { useFormContext } from 'react-hook-form';
import AvatarImage from '@/Components/Global/AvatarImage';
import HookFormInput from '../HookFormInput';
import { Button } from '@/Components/Global/Button';
import { generateUsername } from 'unique-username-generator';
import ErrorDisplayComp from '../ErrorDisplayComp';

const PersonalizeProfile = () => {
  const {
    register,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<typeof registerFormDefaultValues>();
  const profileImageUrl = `https://api.multiavatar.com/${getValues('first_name')}+${getValues('last_name')}.png?apikey=${import.meta.env.MULTIAVATAR}`;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.item(0);
    if (file) {
      setValue('profile_img', URL.createObjectURL(file), { shouldDirty: true });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center">
        Personalize Profile
      </h2>
      <div className="mt-10">
        <div>
          <AvatarImage
            url={watch('profile_img')}
            fallback={profileImageUrl}
            diameter="150px"
            className="mx-auto p-1 border-2 border-white"
          />
          {/* <img
            src={watch('profile_img') ?? profileImageUrl}
            alt="avatar"
            className="w-[150px] h-[150px] rounded-full p-1 border-[1px] mx-auto"
          /> */}
          <div className="flex gap-x-4 mt-6 justify-center">
            <label
              htmlFor="profile_img"
              className="bg-white rounded-md text-black px-6 py-[10px] text-sm hover:opacity-80 cursor-pointer"
            >
              Upload
            </label>
            <input
              type="file"
              className="hidden"
              id="profile_img"
              aria-label="profile_img"
              {...register('profile_img')}
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/jpg, image/avif"
            />
            <Button
              className="ml-4"
              type="button"
              onClick={() => setValue('profile_img', profileImageUrl)}
            >
              Generate Avatar
            </Button>
            <ErrorDisplayComp error={errors.profile_img} />
          </div>
        </div>
        <div className="mt-10">
          <label className="font-semibold">Username</label>
          <br />
          <div className="flex gap-x-">
            <HookFormInput
              register={register}
              errors={errors.username}
              fieldName="username"
              placeholder="Username"
              inputClassName="mt-1"
              shouldShowError={false}
              fieldRules={{
                required: { message: 'Username is required', value: true },
              }}
            />
            <Button
              type="button"
              className="ml-5"
              onClick={() => {
                setValue('username', generateUsername());
              }}
            >
              Generate random
            </Button>
          </div>
          <ErrorDisplayComp error={errors.username} />
        </div>
      </div>
    </div>
  );
};

export default PersonalizeProfile;
