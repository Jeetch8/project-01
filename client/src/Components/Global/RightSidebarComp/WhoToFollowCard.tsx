import React from 'react';
import UserCardWithFollow from './UserCardWithFollow';
import { IAuthProvider, IUser } from '@/utils/interfaces';

const user: IUser = {
  id: '1',
  signup_date: '2024-01-01',
  email: 'elon@musk.com',
  password: 'password',
  auth_provider: 'email' as IAuthProvider,
  email_verified: true,
  first_name: 'Elon',
  last_name: 'Musk',
  full_name: 'Elon Musk',
  username: 'elonmusk',
  profile_img:
    'https://pbs.twimg.com/semantic_core_img/1762162853300109313/WQ0d7-9P?format=jpg&name=240x240',
  bio: 'CEO of SpaceX and Tesla',
  location: 'Los Angeles, CA',
};

export default function WhoToFollowCard() {
  return (
    <div className="border-zinc-700 border-[1px] text-white rounded-xl py-4 mt-4">
      <h2 className="text-[21px] font-bold mb-3 px-5">Who To Follow</h2>
      <UserCardWithFollow user={user} />
    </div>
  );
}
