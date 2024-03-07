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
    method: 'POST',
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
      <div className="border-2 border-white rounded-lg">
        <form
          onSubmit={handleSubmit(async (data) => {
            await doFetch({
              token: getUrlPrama.get('token'),
              password: data.password,
            });
          })}
        >
          <div>
            <label htmlFor="new_password">New Password</label>
            <PasswordInput
              register={register}
              fieldName="password"
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
          <div>
            <label htmlFor="confirm_new_password">Confirm new password</label>
            <PasswordInput
              register={register}
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
          <Button typeof="submit" variant="secondary" size="lg" type="submit">
            Change
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;
