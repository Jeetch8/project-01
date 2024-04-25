interface EditableFieldProps {
  title: string;
  defaultValue: string;
  name: string;
  control: any;
  type?: string;
}

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { FaEdit } from 'react-icons/fa';

const EditableField: React.FC<EditableFieldProps> = ({
  title,
  defaultValue,
  name,
  control,
  type = 'text',
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-400">
        {title}
      </label>
      <div className="mt-1 flex items-center justify-between">
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          render={({ field }) =>
            isEditing ? (
              <input
                {...field}
                type={type}
                className="bg-gray-700 text-white p-2 rounded w-full"
              />
            ) : (
              <span className="text-white">{field.value}</span>
            )
          }
        />
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="ml-2 text-blue-400"
        >
          <FaEdit />
        </button>
      </div>
    </div>
  );
};

export default EditableField;
