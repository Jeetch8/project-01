import { useState, useCallback, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import AsyncSelect from 'react-select/async';
import { base_url } from '@/utils/base_url';
import { getTokenFromLocalStorage } from '@/utils/localstorage';
import AvatarImage from '../AvatarImage';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '@/context/GlobalContext';
import useDebounce from '@/hooks/useDebounce';

interface UserOption {
  id: string;
  value: string;
  label: string;
  username: string;
  full_name: string;
  profile_img: string;
}

interface FormData {
  selectedUser: UserOption | null;
}

export default function SearchInput() {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const { user } = useGlobalContext();
  const { control } = useForm<FormData>({
    defaultValues: {
      selectedUser: null,
    },
  });

  const debouncedInputValue = useDebounce(inputValue, 300);

  const loadOptions = useCallback(
    (inputValue: string, callback: (options: UserOption[]) => void) => {
      if (inputValue.length < 2) {
        callback([]);
        return;
      }
      fetch(`${base_url}/user?query=${inputValue}`, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`,
        },
      })
        .then((res) => res.json())
        .then((data) => callback(data.users));
    },
    []
  );

  const debouncedLoadOptions = useMemo(
    () => (inputValue: string, callback: (options: UserOption[]) => void) => {
      loadOptions(debouncedInputValue, callback);
    },
    [loadOptions, debouncedInputValue]
  );

  return (
    <div className="relative">
      <Controller
        name="selectedUser"
        control={control}
        render={({ field }) => (
          <AsyncSelect
            {...field}
            loadOptions={debouncedLoadOptions}
            onInputChange={(newValue) => setInputValue(newValue)}
            noOptionsMessage={({ inputValue }) =>
              inputValue.length < 2
                ? 'Start typing'
                : 'No users found, try a different search'
            }
            onMenuOpen={() => setMenuIsOpen(true)}
            onMenuClose={() => setMenuIsOpen(false)}
            menuIsOpen={menuIsOpen}
            cacheOptions
            defaultOptions
            closeMenuOnSelect
            placeholder="Search"
            className="text-black border-[2px] border-zinc-900 rounded-full px-2 focus:border-blue-500 outline-blue-500"
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
              Option: ({ data, ...props }) => (
                <div
                  onClick={() => {
                    if (data.id === user?.id) {
                      navigate('/profile/me');
                    } else {
                      navigate(`/profile/${data.username}`);
                    }
                    setMenuIsOpen(false);
                  }}
                  {...props}
                  className="flex items-center p-2 cursor-pointer hover:bg-gray-900 gap-x-3"
                >
                  <AvatarImage url={data.profile_img} diameter="40px" />
                  <div>
                    <div className="font-semibold text-white">
                      {data.full_name}
                    </div>
                    <div className="text-sm text-gray-400">
                      @{data.username}
                    </div>
                  </div>
                </div>
              ),
            }}
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                '&:hover': {
                  border: 'none',
                },
              }),
              input: (provided) => ({
                ...provided,
                color: 'white',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: 'black',
                color: 'white',
                border: '2px solid #2F3336',
              }),
            }}
          />
        )}
      />
    </div>
  );
}
