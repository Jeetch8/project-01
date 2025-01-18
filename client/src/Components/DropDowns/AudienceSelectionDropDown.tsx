import React, { useState, useEffect, useRef } from 'react';
import { PiGlobeHemisphereWestThin } from 'react-icons/pi';
import { IoIosArrowDown } from 'react-icons/io';
import { useDetectOutsideClick } from '@/hooks/useDetectOutsideClick';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { ICommunity } from '@/types/interfaces';
import { HashLoader } from 'react-spinners';

interface AudienceSelectionDropDownProps {
  onAudienceSelect: (audience: { id: string; name: string }) => void;
}

export default function AudienceSelectionDropDown({
  onAudienceSelect,
}: AudienceSelectionDropDownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const outsideClickRef = useDetectOutsideClick(() => setIsDropdownOpen(false));
  const [selectedOption, setSelectedOption] = useState({
    id: 'Everyone',
    name: 'Everyone',
  });
  const [communityList, setCommunityList] = useState<ICommunity[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { doFetch: fetchCommunities, fetchState } = useFetch<{
    communities: ICommunity[];
  }>({
    url: `${base_url}/user/communities`,
    method: 'GET',
    authorized: true,
    onSuccess: (data) => {
      setCommunityList(data.communities);
    },
  });

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    onAudienceSelect(selectedOption);
  }, [selectedOption]);

  const handleSelect = (option: { id: string; name: string }) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="text-[#199BF0] rounded-xl px-3 font-semibold border-[0.1px] border-zinc-800 text-[14px] bg-black"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedOption.name} <IoIosArrowDown className="inline ml-1" />
      </button>
      {isDropdownOpen && (
        <div
          className="absolute bg-black px-4 pb-3 rounded-xl shadow-md shadow-slate-50 text-white z-50 max-h-80 overflow-y-auto"
          ref={outsideClickRef}
        >
          <h2 className="font-bold text-xl mb-4 sticky top-0 bg-black py-2">
            Choose audience
          </h2>
          <div
            className="flex items-center font-semibold space-x-4 cursor-pointer"
            onClick={() => handleSelect({ id: 'Everyone', name: 'Everyone' })}
          >
            <span className="p-2 bg-[#199BF0] rounded-full">
              <PiGlobeHemisphereWestThin className="w-5 h-5" />
            </span>
            <span>Everyone</span>
          </div>
          <h4 className="font-bold mt-4">My Communities</h4>
          {fetchState === 'loading' && (
            <div className="flex justify-center h-[100px]">
              <HashLoader />
            </div>
          )}
          <ul
            style={{
              display: fetchState === 'loading' ? 'none' : 'block',
            }}
          >
            {communityList.map((community) => (
              <li
                key={community.id}
                className="flex items-center font-semibold space-x-4 my-6 cursor-pointer"
                onClick={() =>
                  handleSelect({ id: community.id, name: community.title })
                }
              >
                <img
                  src={community.banner_img}
                  alt="community banner"
                  className="w-12 h-12 rounded-lg object-cover object-center"
                />
                <div>
                  <p>{community.title}</p>
                  <p className="text-sm">
                    {community.members_count}
                    <span className="font-light"> Members</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
