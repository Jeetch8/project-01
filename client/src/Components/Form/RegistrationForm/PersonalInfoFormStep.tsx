import HookFormInput from '../HookFormInput';
import ErrorDisplayComp from '../ErrorDisplayComp';
import { useFormContext } from 'react-hook-form';
import { registerFormDefaultValues } from '@/pages/Register';

const PersonalInfo = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<typeof registerFormDefaultValues>();
  return (
    <div>
      <h2 className="text-3xl font-semibold text-center mb-10">
        Personal Info
      </h2>
      <div className="flex gap-x-6">
        <div className="max-w-[300px] w-full">
          <label className="font-semibold" htmlFor="name">
            Fisrt Name
          </label>
          <HookFormInput
            register={register}
            errors={errors.first_name}
            fieldName="first_name"
            fieldRules={{
              required: {
                message: 'First name is required',
                value: true,
              },
            }}
            inputClassName="rounded-md outline-none text-black px-2 py-1 border-2 mt-1 w-full"
            placeholder="First name"
          />
        </div>
        <div className="max-w-[300px] w-full">
          <label className="font-semibold" htmlFor="name">
            Last Name
          </label>
          <HookFormInput
            register={register}
            errors={errors.last_name}
            fieldName="last_name"
            fieldRules={{
              required: {
                message: 'Last name is required',
                value: true,
              },
            }}
            inputClassName="rounded-md outline-none text-black px-2 py-1 border-2 mt-1 w-full"
            placeholder="Last name"
          />
        </div>
      </div>
      <div className="max-w-[300px] w-full mt-4">
        <label className="font-semibold" htmlFor="date_of_birth">
          Date of birth
        </label>
        <HookFormInput
          register={register}
          placeholder="dd/mm/yyyy"
          fieldName="date_of_birth"
          fieldRules={{
            required: {
              value: true,
              message: 'Date of birth is required',
            },
          }}
          errors={errors.date_of_birth}
          inputType="date"
        />
      </div>
      <div className="max-w-[300px] w-full mt-5">
        <label className="font-semibold" htmlFor="name">
          Gender
        </label>
        <br />
        <select
          {...register('gender', {
            required: { value: true, message: 'Gender is required' },
          })}
          className="text-black rounded-md w-full mt-1"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <ErrorDisplayComp error={errors.gender} />
      </div>
    </div>
  );
};

export default PersonalInfo;
