import { SocketProvider } from '@/context/SocketContext';
import { Outlet } from 'react-router-dom';
import RoomsList from '@/Components/Chat/RoomsList';

const Messages = () => {
  return (
    <SocketProvider>
      <div className="flex text-white">
        <RoomsList />
        <Outlet />
      </div>
    </SocketProvider>
  );
};

export default Messages;
