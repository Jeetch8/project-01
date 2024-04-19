import { SocketEvents } from '@social_media/server/src/socket/socket.constants';
import { getTokenFromLocalStorage } from '@/utils/localstorage';
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  IMessage,
  IMessageWithSender,
  IOnlineRoom,
  IParticipant,
} from '@server/src/socket/socket.types';
import { toast } from 'react-hot-toast'; // Import toast

export interface IContext {
  socket: Socket | null;
  socketLoading: boolean;
  roomsList: IOnlineRoom[];
  joinRoom: (roomId: string) => void;
  createRoom: (data: {
    room_name?: string;
    room_img?: string;
    participants: Omit<IParticipant, 'id'>[];
  }) => void;
  socketUser: IParticipant | null;
  getRoomMessages: (roomId: string) => Promise<IMessage[]>;
  currentRoom: IOnlineRoom | null;
  setCurrentRoom: (room: IOnlineRoom) => void;
}

const socketContext = createContext<IContext>({
  socket: null,
  socketLoading: false,
  createRoom: () => {},
  joinRoom: () => {},
  roomsList: [],
  socketUser: null,
  getRoomMessages: () => Promise.resolve([]),
  currentRoom: null,
  setCurrentRoom: () => {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketLoading, setSocketLoading] = useState(false);
  const [roomsList, setRoomsList] = useState<IOnlineRoom[]>([]);
  const [socketUser, setSocketUser] = useState<IParticipant | null>(null);
  const [currentRoom, setCurrentRoom] = useState<IOnlineRoom | null>(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000', {
      auth: { token: getTokenFromLocalStorage() },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });
    setSocketLoading(true);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setSocketLoading(false);
    });

    socketInstance.on(
      SocketEvents.INITIAL_DATA,
      (data: { userRooms: IOnlineRoom[]; participant: IParticipant }) => {
        console.log(data);
        setRoomsList(data.userRooms);
        setSocketUser(data.participant);
      }
    );
    socketInstance.on(
      SocketEvents.MESSAGE,
      (data: { roomId: string; message: IMessageWithSender }) => {
        console.log(data, 'data');
        setCurrentRoom((prev) => {
          if (prev) {
            return {
              ...prev,
              chatHistory: [data.message, ...prev.chatHistory],
            };
          }
          return prev;
        });
      }
    );

    socketInstance.on(SocketEvents.ROOM_CREATED, (data) => {
      setRoomsList((prev) => [...prev, data]);
    });

    // Add error event listener
    socketInstance.on(SocketEvents.ERROR, (error: string) => {
      toast.error(error);
    });

    return () => {
      socketInstance.off(SocketEvents.CHAT_HISTORY);
      socketInstance.off(SocketEvents.ERROR); // Remove error event listener
      socketInstance.disconnect();
    };
  }, []);

  const createRoom = (data: {
    room_name?: string;
    room_img?: string;
    participants: Omit<IParticipant, 'id'>[];
  }) => {
    socket?.emit(SocketEvents.CREATE_ROOM, data);
  };

  const joinRoom = (roomId: string) => {
    socket?.emit(SocketEvents.JOIN_ROOM, { roomId });
  };

  const getRoomMessages = (roomId: string): Promise<IMessage[]> => {
    return new Promise((resolve, reject) => {
      socket?.emit(SocketEvents.GET_ROOM_MESSAGES, { roomId });
      socket?.once(SocketEvents.GET_ROOM_MESSAGES, (messages: IMessage[]) => {
        resolve(messages);
      });
      socket?.once('error', (error: string) => {
        reject(new Error(error));
      });
    });
  };

  return (
    <socketContext.Provider
      value={{
        socket,
        socketLoading,
        roomsList,
        joinRoom,
        currentRoom,
        setCurrentRoom,
        createRoom,
        socketUser,
        getRoomMessages,
      }}
    >
      {children}
    </socketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(socketContext);
  return context;
};
