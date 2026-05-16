"use client";

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  description?: string;
  rows?: number;
  required?: boolean;
}

const TextAreaField = ({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  description,
  rows = 4,
  required = false,
}: TextAreaFieldProps) => {
  const remaining = maxLength - value.length;
  const isOverLimit = remaining < 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && " *"}
        </label>
        <span
          className={`text-xs ${
            isOverLimit
              ? "text-red-600 font-medium"
              : remaining <= 20
                ? "text-amber-600"
                : "text-gray-400"
          }`}
        >
          {value.length}/{maxLength}
        </span>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y ${
          isOverLimit ? "border-red-300" : "border-gray-300"
        }`}
      />
    </div>
  );
};

export default TextAreaField;
