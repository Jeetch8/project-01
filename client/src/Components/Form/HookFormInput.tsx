type InputProps = {
  fieldName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  fieldRules?: RegisterOptions;
  errors: FieldError | undefined;
  inputClassName?: string;
  placeholder?: string;
  inputName?: string;
  inputType?: React.HTMLInputTypeAttribute;
};

import { FieldError, RegisterOptions } from 'react-hook-form';
import ErrorDisplayComp from './ErrorDisplayComp';
import { twMerge } from 'tailwind-merge';

const HookFormInput = ({
  register,
  fieldName,
  fieldRules,
  errors,
  inputClassName,
  placeholder,
  inputName,
  inputType = 'text',
}: InputProps) => {
  return (
    <>
      <input
        type={inputType}
        placeholder={placeholder}
        {...register(fieldName, fieldRules)}
        className={twMerge(
          'rounded-md outline-none text-black w-[300px] px-2 py-1 border-2 mt-1',
          inputClassName
        )}
        id={inputName ?? fieldName}
        name={inputName ?? fieldName}
      />
      <ErrorDisplayComp error={errors} />
    </>
  );
};

export default HookFormInput;
