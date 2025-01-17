interface Props {
  register: any;
  checkboxRules?: RegisterOptions;
  fieldName: string;
  inputClassName?: string;
  label?: string;
}

import { RegisterOptions } from "react-hook-form";

const HookSwitchCheckbox = ({
  register,
  checkboxRules,
  fieldName,
  inputClassName,
  label,
}: Props) => {
  return (
    <label className="checkbox-switch" htmlFor={fieldName}>
      <input
        {...register(fieldName, checkboxRules)}
        type="checkbox"
        role="checkbox"
        id={fieldName}
        aria-label={label}
        className={inputClassName}
      />
      <div className="checkbox-switch-slider round"></div>
    </label>
  );
};

export default HookSwitchCheckbox;
