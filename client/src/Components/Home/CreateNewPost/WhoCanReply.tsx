"use client";

import React, { useState } from "react";
import { PiGlobeHemisphereWestThin } from "react-icons/pi";
import { IoIosArrowDown } from "react-icons/io";
import { useDetectOutsideClick } from "@/hooks/useDetectOutsideClick";

export default function WhoCanReply() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Everyone");
  const options = ["Everyone", "Freelance starter", "Devs"];
  const dropdownRef = useDetectOutsideClick(() => setIsDropdownOpen(false));

  return (
    <div className="realtive" ref={dropdownRef}>
      <button
        className="text-[#199BF0] rounded-xl px-3 font-semibold border-[0.1px] border-zinc-800 text-[14px]"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedOption} <IoIosArrowDown className="inline ml-1" />
      </button>
      {isDropdownOpen && (
        <div className="absolute bg-black px-4 py-3 rounded-xl shadow-md shadow-slate-50 text-white">
          <h2 className="font-bold text-xl mb-4">Choose audience</h2>
          <div className="flex items-center font-semibold space-x-2">
            <span className="p-2 bg-[#199BF0] rounded-full">
              <PiGlobeHemisphereWestThin className="w-5 h-5" />
            </span>
            <span>Everyone</span>
          </div>
          <h4></h4>
        </div>
      )}
    </div>
  );
}
