"use client";

interface ISearchResults {
  id: string;
  avatar: string;
  name: string;
  username: string;
}

import { useEffect, useRef, useState } from "react";
import { RiSearchLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";

export default function SearchInput() {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<ISearchResults[]>([]);
  const [boxResultsBoxOpen, setResultsBoxOpen] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setResultsBoxOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchInputRef]);

  return (
    <div className="relative" ref={searchInputRef}>
      <div
        className={twMerge(
          "flex items-center bg-zinc-800 px-5 rounded-full py-2 space-x-4 border-[0.5px] border-zinc-800 z-50",
          boxResultsBoxOpen && "border-blue-400"
        )}
      >
        <RiSearchLine
          className={twMerge(
            "text-zinc-400",
            boxResultsBoxOpen && "text-blue-400"
          )}
        />
        <input
          onClick={() => setResultsBoxOpen(true)}
          type="text"
          placeholder="Search"
          className="bg-transparent w-full outline-none text-white placeholder-zinc-400"
        />
      </div>
      {boxResultsBoxOpen && (
        <div className="absolute border-2 border-zinc-800 bg-black w-full min-h-[200px] rounded-xl top-10 z-10">
          {searchResults.length === 0 ? (
            searchInput.length > 0 ? (
              <p className="text-white text-center">No results found</p>
            ) : (
              <p className=" text-center mt-4 text-zinc-500">
                Try saerching for people, list or keywords
              </p>
            )
          ) : (
            searchResults.map((el) => {
              return (
                <div key={el.id} className="flex items-center space-x-4">
                  <img
                    src={el.avatar}
                    alt="avatar"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h1>{el.name}</h1>
                    <p>{el.username}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
