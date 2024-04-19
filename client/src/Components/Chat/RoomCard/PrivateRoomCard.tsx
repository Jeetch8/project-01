import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import AvatarImage from '@/Components/Global/AvatarImage';

interface RoomCardProps {
  profileImg: string;
  name: string;
  lastMessage?: string;
  lastUpdated: string;
  roomId: string;
  // username: string;
}

const PrivateRoomCard: React.FC<RoomCardProps> = ({
  profileImg,
  name,
  // username,
  lastMessage,
  lastUpdated,
  roomId,
}) => {
  const navigate = useNavigate();
  const { id: paramRoomId } = useParams<{ id: string }>();

  const isSelected = paramRoomId === roomId;

  return (
    <div
      className={twMerge(
        `cursor-pointer py-4 pl-4 hover:bg-zinc-900 duration-300`,
        isSelected && 'bg-gray-900 border-r-2 border-blue-800'
      )}
      onClick={() => navigate(`/messages/private/${roomId}`)}
    >
      <div className="flex items-center">
        <AvatarImage url={profileImg} diameter="48px" className="mr-4" />
        <div>
          <h1 className="font-semibold">
            {name}{' '}
            <span className="text-gray-400 text-sm">
              {/* <span className="mr-1">@{username}</span> */}
              <span>·</span>
              <span className="ml-1">{lastUpdated}</span>
            </span>
          </h1>
          <p className="text-gray-400 text-sm truncate h-5">
            {lastMessage?.slice(0, 20)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivateRoomCard;
