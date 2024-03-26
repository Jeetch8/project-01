import React from 'react';
import TickGif from '@/assets/icons8-tick.gif';

const Complete = () => {
  return (
    <div className="bg-white text-black py-6 rounded-md">
      <div className="text-black text-center mb-5 mt-3">
        <h1 className="font-semibold text-center text-3xl">Email Sent</h1>
        <img
          src={TickGif}
          alt="tick mark gif"
          width={120}
          className="mx-auto"
        />
        <p className="mt-6">
          Please check your email and click the link to verify your email
          address
        </p>
      </div>
    </div>
  );
};

export default Complete;
