import NewsCard from './NewsCard';
import React from 'react';

export default function WhatsHappeninigCard() {
  return (
    <div className="bg-zinc-800 rounded-xl py-4 mt-4">
      <h2 className="text-[21px] font-bold mb-3 px-5">What's happening</h2>
      <NewsCard />
      <NewsCard />
    </div>
  );
}
