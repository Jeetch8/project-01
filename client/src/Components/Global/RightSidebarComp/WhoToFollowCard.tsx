import UserCardWithFollow from './UserCardWithFollow';
import { IUser } from '@/types/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { useEffect } from 'react';

export default function WhoToFollowCard() {
  const { dataRef, doFetch } = useFetch<{ users: IUser[] }>({
    url: base_url + '/user/who-to-follow',
    authorized: true,
    method: 'GET',
    onSuccess(data) {
      console.log(data);
    },
  });

  useEffect(() => {
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="border-zinc-700 border-[1px] text-white rounded-xl py-4 mt-4">
      <h2 className="text-[21px] font-bold mb-3 px-5">Who To Follow</h2>
      <div className="">
        {dataRef.current?.users.map((user) => (
          <UserCardWithFollow key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
