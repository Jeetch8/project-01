import React from 'react';
import UserCardWithFollow from './UserCardWithFollow';

export default function WhoToFollowCard() {
  return (
    <div className="border-zinc-700 border-[1px] text-white rounded-xl py-4 mt-4">
      <h2 className="text-[21px] font-bold mb-3 px-5">Who To Follow</h2>
      <UserCardWithFollow />
    </div>
  );
}
