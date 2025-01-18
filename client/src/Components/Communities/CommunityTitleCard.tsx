import React from 'react';
import { ICommunity } from '@/types/interfaces';
import { useNavigate } from 'react-router-dom';

interface Props {
  community: ICommunity;
}

const CommunityTitleCard: React.FC<Props> = ({ community }) => {
  const navigate = useNavigate();

  return (
    <div
      className="h-[90px] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] cursor-pointer w-[100px] flex-[0 0 0 100%] min-w-[160px]"
      onClick={() => navigate('/communities/' + community.id)}
    >
      <div className="h-3/4 w-full">
        <img
          src={community.banner_img}
          alt={community.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="h-1/4 w-full bg-zinc-900 flex items-center justify-center">
        <p className="text-white text-sm font-semibold truncate px-2">
          {community.title}
        </p>
      </div>
    </div>
  );
};

export default CommunityTitleCard;
