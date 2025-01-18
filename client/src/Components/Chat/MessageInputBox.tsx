import { VscSend } from 'react-icons/vsc';

import React, { useState } from 'react';
import { IParticipant, ISenderMessage } from '@/types/socket';
import { SocketEvents } from '@/types/socket';
import { useSocketContext } from '@/context/SocketContext';

const MessageInputBox = () => {
  const { socketUser, socket, currentRoom } = useSocketContext();
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const msgObj: ISenderMessage = {
      content: newMessage,
      contentType: 'text',
      sender: socketUser as IParticipant,
      room: currentRoom?.id || '',
    };
    if (newMessage.trim() && socket) {
      socket.emit(SocketEvents.MESSAGE, msgObj);
      setNewMessage('');
    }
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="p-2 bg-black border-t-[2px] border-zinc-900"
    >
      <div className=" bg-zinc-800 rounded-lg overflow-hidden flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow bg-zinc-800 text-white px-4 py-2 focus:outline-none h-12 w-full"
          style={{
            border: 'none',
            boxShadow: 'none',
            outline: 'none',
            borderRadius: '0px',
          }}
          placeholder="Type a message..."
        />
        <div>
          <button
            type="submit"
            className="text-white transition duration-200 mr-2 py-2 px-2 hover:bg-blue-600 rounded-full"
          >
            <VscSend />
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageInputBox;
