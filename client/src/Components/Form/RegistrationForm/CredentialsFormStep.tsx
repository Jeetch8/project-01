import PasswordInput from '../PasswordInput';
import HookFormInput from '../HookFormInput';
import { emailRegex, passwordRegex } from '@/utils/Regex';
import { useFormContext } from 'react-hook-form';
import { registerFormDefaultValues } from '@/pages/Register';

const Credentials = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<typeof registerFormDefaultValues>();
  return (
    <div>
      <h2 className="text-3xl font-semibold">Security Credentials</h2>
      <div className="max-w-[300px] w-full mt-6">
        <label className="font-semibold" htmlFor="email">
          Email
        </label>
        <HookFormInput
          register={register}
          fieldName="email"
          fieldRules={{
            required: {
              value: true,
              message: 'Email is required',
            },
            pattern: {
              value: emailRegex,
              message: 'Email is not valid',
            },
          }}
          inputClassName="rounded-md outline-none text-black px-2 py-1 border-2 mt-1 w-full"
          placeholder="Email"
          errors={errors.email}
        />
      </div>

      <div className="w-full max-w-[300px] mt-4">
        <label className="font-semibold" htmlFor="password">
          Password
        </label>
        <PasswordInput
          fieldName="password"
          register={register}
          fieldRules={{
            required: {
              value: true,
              message: 'Password is required',
            },
            pattern: {
              value: passwordRegex,
              message:
                'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one symbol',
            },
          }}
          inputClassName="rounded-md outline-none text-black  w-[260px] px-2 py-2"
          outerClassName="mt-1"
          placeholder="Password"
          errors={errors.password}
        />
      </div>
      <div className="w-full max-w-[300px] mt-4">
        <label className="font-semibold" htmlFor="password">
          Confirm Password
        </label>
        <PasswordInput
          fieldName="confirmPassword"
          register={register}
          fieldRules={{
            required: {
              value: true,
              message: 'Password confirmation is required',
            },
            validate: (value) =>
              value === watch('password') || 'Passwords do not match',
          }}
          inputClassName="rounded-md outline-none text-black  w-[260px] px-2 py-2"
          outerClassName="mt-1"
          placeholder="Confirm password"
          errors={errors.confirmPassword}
        />
      </div>
    </div>
  );
};

export default Credentials;
