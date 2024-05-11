import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { IParticipant } from '@server/src/socket/socket.types';
import ProfileImgsInSquare from '../ProfileImgsInSquare';
import AvatarImage from '@/Components/Global/AvatarImage';

interface RoomCardProps {
  name: string;
  lastMessage?: string;
  lastUpdated: string;
  roomId: string;
  profile_img?: string;
  participants: IParticipant[];
}

const GroupRoomCard: React.FC<RoomCardProps> = ({
  name,
  participants,
  lastMessage,
  lastUpdated,
  profile_img,
  roomId,
}) => {
  const navigate = useNavigate();
  const { id: paramRoomId } = useParams<{ id: string }>();

  const isSelected = paramRoomId === roomId;

  return (
    <div
      className={twMerge(
        `cursor-pointer py-4 pl-4 hover:bg-zinc-900 duration-300 h-fit text-white`,
        isSelected && 'bg-gray-900 border-r-2 border-blue-800'
      )}
      onClick={() => navigate(`/messages/group/${roomId}`)}
    >
      <div className="flex gap-x-4 h-fit">
        {profile_img ? (
          <AvatarImage url={profile_img} diameter="48px" />
        ) : (
          <ProfileImgsInSquare participants={participants} />
        )}
        <div className="h-fit">
          <h1 className="font-semibold">
            {name}{' '}
            <span className="text-gray-400 text-sm">
              <span>·</span>
              <span className="ml-1">{lastUpdated}</span>
            </span>
          </h1>
          <p className="text-gray-400 text-sm truncate h-5">
            {lastMessage?.slice(0, 20)}asdsadasd
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupRoomCard;
