'use client';

import React, { useState } from 'react';
import { PiGlobeHemisphereWestThin } from 'react-icons/pi';
import { IoIosArrowDown } from 'react-icons/io';
import { useDetectOutsideClick } from '@/hooks/useDetectOutsideClick';

export default function AudienceSelection() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Everyone');
  const [communtyList, setCommunityList] = useState([
    {
      id: 'asdad21',
      title: 'Freelance starter',
      banner_img:
        'https://pbs.twimg.com/community_banner_img/1498429418209005570/rC1J_sj5?format=jpg&name=120x120',
      members: 1563,
    },
    {
      id: 'asdad22',
      title: 'Devs',
      banner_img:
        'https://pbs.twimg.com/community_banner_img/1498429418209005570/rC1J_sj5?format=jpg&name=120x120',
      members: 876,
    },
  ]);
  const dropdownRef = useDetectOutsideClick(() => setIsDropdownOpen(false));

  return (
    <div className="realtive z-50" ref={dropdownRef}>
      <button
        className="text-[#199BF0] rounded-xl px-3 font-semibold border-[0.1px] border-zinc-800 text-[14px]"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedOption} <IoIosArrowDown className="inline ml-1" />
      </button>
      {isDropdownOpen && (
        <div className="absolute bg-black px-4 py-3 rounded-xl shadow-md shadow-slate-50 text-white">
          <h2 className="font-bold text-xl mb-4">Choose audience</h2>
          <div className="flex items-center font-semibold space-x-4">
            <span className="p-2 bg-[#199BF0] rounded-full">
              <PiGlobeHemisphereWestThin className="w-5 h-5" />
            </span>
            <span>Everyone</span>
          </div>
          <h4 className="font-bold mt-4">My Communities</h4>
          <ul>
            {communtyList.map((community) => (
              <li
                key={community.id}
                className="flex items-center font-semibold space-x-4 my-6"
              >
                <img
                  src={community.banner_img}
                  alt="community banner"
                  className="w-12 h-12 rounded-lg object-cover object-center"
                />
                <div>
                  <p>{community.title}</p>
                  <p className="text-sm">
                    {community.members}
                    <span className="font-light">Members</span>
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
