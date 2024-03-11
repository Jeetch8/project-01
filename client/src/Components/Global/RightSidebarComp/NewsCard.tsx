import React from 'react';

export default function NewsCard() {
  return (
    <div className="flex justify-between py-3 cursor-pointer px-5">
      {/* left side/ text side */}
      <div>
        <h3 className="font-bold text-[16px]">Paris Fashio Week Fall 2024</h3>
        <p className="text-sm text-zinc-500">Fashion · Live</p>
        <p className="text-sm text-zinc-500">
          Trending with <span className="text-blue-400">#ParisFashionWeek</span>
        </p>
      </div>
      {/* Right side with picture */}
      <div>
        <img
          className="w-[80px] h-[65px] rounded-xl overflow-hidden"
          src="https://pbs.twimg.com/semantic_core_img/1762162853300109313/WQ0d7-9P?format=jpg&name=240x240"
          alt="Paris Fashion Week"
        />
      </div>
    </div>
  );
}
