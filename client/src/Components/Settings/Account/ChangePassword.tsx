import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import PasswordInput from '@/Components/Form/PasswordInput';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import { passwordRegex } from '@/utils/Regex';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const inputClassName = 'bg-transparent text-white w-full py-3';
const outerClassName =
  'bg-transparent w-full outline-2 border-neutral-900 border-2 mt-1';
const iconColor = 'white';

const ChangePassword = () => {
  const navigate = useNavigate();
  const formMethods = useForm<ChangePasswordFormData>();
  const {
    formState: { errors, isValid },
  } = formMethods;

  const { fetchState, doFetch } = useFetch<{ message: string }>({
    url: base_url + '/user/change-password',
    method: 'PATCH',
    authorized: true,
    onSuccess: () => {
      toast.success('Password changed successfully');
      formMethods.reset();
    },
    onError: (err) => {
      if (!Array.isArray(err.message)) {
        toast.error(err.message);
      }
    },
  });

  return (
    <div className="text-white">
      <div className="px-4 py-4 mb-3 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full transition-colors duration-200 hover:bg-gray-900"
        >
          <IoArrowBack size={18} />
        </button>
        <h1 className="text-xl font-semibold">Change your password</h1>
      </div>
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(async (data) => {
            const formData = new FormData();
            Object.entries(data).forEach((el) => {
              formData.append(el[0], el[1].toLocaleString());
            });
            await doFetch(formData);
          })}
          className="px-4 space-y-4"
        >
          <div className="pb-5">
            <label
              htmlFor="currentPassword"
              className="text-sm mb-0 font-semibold ml-1
              "
            >
              Current password
            </label>
            <PasswordInput
              iconColor={iconColor}
              outerClassName={outerClassName}
              inputClassName={inputClassName}
              fieldName="currentPassword"
              register={formMethods.register}
              errors={errors.currentPassword}
              placeholder="Current password"
              fieldRules={{ required: 'Current password is required' }}
            />
          </div>
          <div className="border-y-[2px] border-zinc-900  pt-4">
            <div>
              <label
                htmlFor="newPassword"
                className="text-sm mb-0 font-semibold ml-1
              "
              >
                New password
              </label>
              <PasswordInput
                iconColor={iconColor}
                outerClassName={outerClassName}
                inputClassName={inputClassName}
                fieldName="newPassword"
                register={formMethods.register}
                errors={errors.newPassword}
                placeholder="New password"
                fieldRules={{
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long',
                  },
                  pattern: {
                    value: passwordRegex,
                    message:
                      'Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
                  },
                }}
              />
            </div>
            <div className="pb-10 mt-4">
              <label
                htmlFor="confirmPassword"
                className="text-sm mb-0 font-semibold ml-1
              "
              >
                Confirm new password
              </label>
              <PasswordInput
                iconColor={iconColor}
                outerClassName={outerClassName}
                inputClassName={inputClassName}
                fieldName="confirmPassword"
                register={formMethods.register}
                errors={errors.confirmPassword}
                placeholder="Confirm new password"
                fieldRules={{
                  required: 'Please confirm your new password',
                  validate: (value) =>
                    value === formMethods.watch('newPassword') ||
                    'Passwords do not match',
                }}
              />
            </div>
          </div>
          <br />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isValid || fetchState === 'loading'}
              className={twMerge(
                'bg-blue-500 text-white font-bold py-2 px-5 rounded-full',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'hover:bg-blue-600 transition-colors duration-200'
              )}
            >
              {fetchState === 'loading' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ChangePassword;
