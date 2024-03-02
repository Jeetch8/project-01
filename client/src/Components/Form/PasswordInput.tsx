interface Props {
  outerClassName?: string;
  inputClassName?: string;
  errors: FieldError | undefined;
  fieldName: string;
  // register: (
  //   name: TFormFor,
  //   options?: RegisterOptions
  // ) => UseFormRegisterReturn<TFormFor>;
  fieldRules?: RegisterOptions;
  register: any;
  placeholder?: string;
}

import { useEffect, useState } from "react";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { FieldError, RegisterOptions } from "react-hook-form";
import ErrorDisplayComp from "./ErrorDisplayComp";

function PasswordInput({
  register,
  placeholder,
  outerClassName,
  inputClassName,
  errors,
  fieldRules,
  fieldName,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (showPassword) {
      setTimeout(() => {
        if (showPassword) setShowPassword(false);
      }, 2000);
    }
  }, [showPassword]);

  return (
    <>
      <div
        className={twMerge(
          "bg-white flex items-center h-fit w-fit rounded-md border-[1px] border-black",
          outerClassName
        )}
      >
        <input
          {...register(fieldName, fieldRules)}
          className={twMerge(
            "rounded-md outline-none text-black px-2 py-1 border-none",
            inputClassName
          )}
          type={showPassword ? "text" : "password"}
          name={fieldName}
          placeholder={placeholder}
          id={fieldName}
        />
        <button
          aria-label="Password visiblity toggler"
          type="button"
          className="mx-2 h-fit"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FiEyeOff color="black" /> : <FiEye color="black" />}
        </button>
      </div>
      <ErrorDisplayComp error={errors} />
    </>
  );
}

export default PasswordInput;
