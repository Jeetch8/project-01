import React from "react";
import AvatarImage from "../AvatarImage";

export default function UserCardWithFollow() {
  return (
    <div>
      <div className="flex justify-between py-3 hover:bg-zinc-700 cursor-pointer px-5">
        <div className="flex items-center">
            <AvatarImage
              url="https://pbs.twimg.com/semantic_core_img/1762162853300109313/WQ0d7-9P?format=jpg&name=240x240"
              diameter="100px"
            />
          <div className="ml-3">
            <h3 className="font-bold text-[16px]">Elon Musk</h3>
            <p className="text-sm">@elonmusk</p>
          </div>
        </div>
        <div>
          <button className="bg-white text-black px-4 py-2 font-semibold rounded-full hover:bg-slate-100">
            Follow
          </button>
        </div>
      </div>
    </div>
  );
}
