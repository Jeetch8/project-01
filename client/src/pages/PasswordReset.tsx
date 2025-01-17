import PasswordInput from '@/Components/Form/PasswordInput';
import { Button } from '@/Components/Global/Button';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { passwordRegex } from '@/utils/Regex';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const PasswordReset = () => {
  const [getUrlPrama] = useSearchParams();
  const { doFetch } = useFetch({
    url: base_url + '/auth/reset-password',
    method: 'PATCH',
    onSuccess: () => {
      toast.success('Password reseted');
    },
    onError: (err) => {
      if (typeof err.message === 'string') toast.error(err.message);
    },
  });
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="border-2 border-white rounded-lg px-10 py-5">
        <form
          onSubmit={handleSubmit(async (data) => {
            const token = getUrlPrama.get('token');
            if (!token) {
              toast.error('Token is required');
              return;
            }
            await doFetch({
              token: getUrlPrama.get('token'),
              password: data.password,
            });
          })}
        >
          <p className="text-wrap font-semibold text-lg text-white">
            Please Enter a new password to change <br /> your existing password
          </p>
          <div className="text-white mt-6">
            <label htmlFor="new_password" className="font-semibold">
              New Password
            </label>
            <PasswordInput
              outerClassName="mt-1 font-semibold"
              register={register}
              fieldName="password"
              placeholder="New password"
              fieldRules={{
                required: { value: true, message: 'Password is required' },
                pattern: {
                  value: passwordRegex,
                  message: 'Password is not strong',
                },
              }}
              errors={errors.password}
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="confirm_new_password font-semibold"
              className="text-white font-semibold"
            >
              Confirm new password
            </label>
            <PasswordInput
              outerClassName="mt-1"
              register={register}
              placeholder="Confirm new password"
              fieldName="confirmPassword"
              fieldRules={{
                required: {
                  value: true,
                  message: 'Password confirmation is required',
                },
                validate: (value) =>
                  value === watch('password') || 'Passwords do not match',
              }}
              errors={errors.confirmPassword}
            />
          </div>
          <Button
            typeof="submit"
            variant="default"
            size="lg"
            type="submit"
            className="mt-4"
          >
            Change
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;
