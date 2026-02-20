/**
 * InputField Component
 * Reusable form input field with validation support
 */

import { FieldError } from 'react-hook-form';

export interface InputFieldProps {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
}

export const InputField = ({
  label,
  type = 'text',
  register,
  name,
  defaultValue,
  error,
  inputProps,
  className = 'w-full md:w-1/4',
}: InputFieldProps) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type={type}
        {...register(name)}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        {...inputProps}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
