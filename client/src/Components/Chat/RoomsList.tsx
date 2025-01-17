import { useSocketContext } from '@/context/SocketContext';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { TbMessage2Plus } from 'react-icons/tb';
import NewMessageModal from '../Modals/NewMessageModal';
import { useState } from 'react';
import PrivateRoomCard from './RoomCard/PrivateRoomCard';
import GroupRoomCard from './RoomCard/GroupRoomCard';

dayjs.extend(relativeTime);

const RoomsList = () => {
  const { socketUser } = useSocketContext();
  const { roomsList } = useSocketContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-[400px] border-r-[1px] border-zinc-900 text-white">
      <div className="flex justify-between py-3 px-5 bg-[rgba(0,0,0,0.9)] backdrop-blur-xl sticky top-0 z-50">
        <h2 className="font-bold text-[20px]">Messages</h2>
        <button
          className="flex items-center text-white px-4 py-2 rounded-full hover:bg-zinc-800"
          onClick={() => setIsModalOpen(true)}
        >
          <TbMessage2Plus size={20} />
        </button>
      </div>
      <div>
        {roomsList.map((room) => {
          const lastUpdated = dayjs(room.updatedAt).fromNow();
          if (room.roomType === 'private') {
            const otherUser = room.participants.find(
              (participant) => participant?.id !== socketUser?.id
            );
            return (
              <PrivateRoomCard
                key={room.id}
                // username={otherUser?.username || ''}
                roomId={room.id}
                lastUpdated={lastUpdated}
                profileImg={otherUser?.profile_img || ''}
                name={otherUser?.name || ''}
                lastMessage={room?.lastMessage?.content}
              />
            );
          } else {
            return (
              <GroupRoomCard
                key={room.id}
                roomId={room.id}
                lastUpdated={lastUpdated}
                name={room.name || ''}
                lastMessage={room?.lastMessage?.content || ''}
                participants={room.participants}
              />
            );
          }
        })}
      </div>
      <NewMessageModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
};

export default RoomsList;
