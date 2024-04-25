import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { MdArrowForwardIos } from 'react-icons/md';
import { IUserSession } from '@/utils/interfaces';
import { useFetch } from '@/hooks/useFetch';
import { base_url } from '@/utils/base_url';
import { HashLoader } from 'react-spinners';
import { CiLaptop } from 'react-icons/ci';
import { RxMobile } from 'react-icons/rx';
import { IoTabletPortraitOutline } from 'react-icons/io5';

const Sessions: React.FC = () => {
  const navigate = useNavigate();

  const { doFetch, dataRef, fetchState } = useFetch<{
    sessions: IUserSession[];
    user_ip: string;
  }>({
    url: base_url + '/user/sessions',
    method: 'GET',
    authorized: true,
  });

  useEffect(() => {
    doFetch();
  }, []);

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return <RxMobile />;
    if (device.toLowerCase().includes('tablet'))
      return <IoTabletPortraitOutline />;
    return <CiLaptop />;
  };

  if (fetchState === 'loading') {
    <div className="flex items-center justify-center h-full">
      <HashLoader />
    </div>;
  }

  return (
    <div className="text-white">
      <div className="px-4 py-4 mb-3 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full transition-colors duration-200 hover:bg-gray-900"
        >
          <IoArrowBack size={18} />
        </button>
        <h1 className="text-xl font-semibold">Sessions</h1>
      </div>
      <div className="px-4">
        {dataRef.current?.sessions?.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between py-4 border-b border-gray-700 hover:bg-neutral-900 px-3 cursor-pointer rounded-md"
          >
            <div className="flex items-center">
              <div className="mr-4 text-2xl border border-gray-700 rounded-full p-2">
                {getDeviceIcon(session.device)}
              </div>
              <div>
                <div className="font-semibold">{session.operating_system}</div>
                <div className="text-sm text-gray-400">{session.location}</div>
              </div>
              {session.ip_address === dataRef.current?.user_ip && (
                <span className="ml-2 px-2 py-1 text-xs font-semibold text-blue-100 bg-blue-500 rounded-full">
                  Active now
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sessions;
