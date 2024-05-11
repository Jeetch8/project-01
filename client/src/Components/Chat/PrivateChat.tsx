import { useSocketContext } from '@/context/SocketContext';
import MessageInputBox from './MessageInputBox';
import AvatarImage from '../Global/AvatarImage';
import { useEffect } from 'react';
import { redirect, useParams } from 'react-router-dom';
import ChatDisplayBox from './ChatDisplayBox';

const PrivateChatDisplay = () => {
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

  // useEffect(() => {
  //   if (roomId) {
  //     fetchMessages();
  //   }
  // }, [roomId]);

  const otherUser = currentRoom?.participants.find(
    (participant) => participant?.id !== socketUser?.id
  );
  console.log(otherUser, currentRoom);

  return (
    <div className="flex flex-col h-screen w-[620px] border-r-[1px] border-zinc-900 bg-black">
      <div className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm px-4 border-b-[2px] border-zinc-900 py-5">
        <div className="flex items-center gap-x-3">
          <AvatarImage url={otherUser?.profile_img} diameter="45px" />
          <h1 className="text-[20px] font-semibold leading-5">
            {otherUser?.name}
          </h1>
        </div>
      </div>
      <ChatDisplayBox />
      <MessageInputBox />
    </div>
  );
};

export default PrivateChatDisplay;
