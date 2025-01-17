import { useEffect } from 'react';
import MessageInputBox from './MessageInputBox';
import { redirect, useParams } from 'react-router-dom';
import { useSocketContext } from '@/context/SocketContext';
import AvatarImage from '../Global/AvatarImage';
import SidedProfileImgs from './SidedProfileImgs';
import ChatDisplayBox from './ChatDisplayBox';

const GroupChatDisplay = () => {
  const { currentRoom, socketUser, setCurrentRoom, joinRoom, roomsList } =
    useSocketContext();
  const { id: roomId } = useParams<{ id: string }>();

  useEffect(() => {
    const room = roomsList?.find((room) => room.id === roomId);
    if (roomId && room) {
      joinRoom(room.id);
      setCurrentRoom(room);
    }
    if (!room) redirect('/404');
  }, [roomId, roomsList]);

  return (
    <div className="flex flex-col h-screen w-[620px] border-r-[1px] border-zinc-900 bg-black">
      <div className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm px-4 border-b-[1px] border-zinc-900 py-5">
        <div className="flex items-center gap-x-3">
          {currentRoom?.room_img ? (
            <AvatarImage url={currentRoom?.room_img} diameter="48px" />
          ) : (
            <SidedProfileImgs participants={currentRoom?.participants || []} />
          )}
          <div>
            <h1 className="text-[20px] font-semibold leading-5">
              {currentRoom?.name}
            </h1>
            <p className="text-sm text-gray-500">
              {currentRoom?.participants.length} participants
            </p>
          </div>
        </div>
      </div>
      <ChatDisplayBox />
      <MessageInputBox />
    </div>
  );
};

export default GroupChatDisplay;
