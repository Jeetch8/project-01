import React from 'react';
import { IMessageWithSender } from '@/types/socket';
import { useSocketContext } from '@/context/SocketContext';
import { twMerge } from 'tailwind-merge';
import AvatarImage from '@/Components/Global/AvatarImage';

interface ChatBubbleProps {
  message: IMessageWithSender;
}

const PrivateChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const { socketUser } = useSocketContext();
  const isOwnMessage = message.sender.id === socketUser?.id;

  return (
    <div
      className={twMerge(
        `flex mb-2`,
        isOwnMessage ? 'justify-end' : 'justify-start'
      )}
    >
      <div className={twMerge(isOwnMessage ? 'text-right' : 'text-left')}>
        <div className="flex items-center">
          {!isOwnMessage && (
            <div className="mr-2">
              <AvatarImage url={message.sender.profile_img} diameter="30px" />
            </div>
          )}
          <div
            className={twMerge(
              `w-fit px-5 py-2 rounded-3xl`,
              isOwnMessage ? 'bg-blue-500 ml-auto' : 'bg-gray-700'
            )}
          >
            <p className="text-white">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateChatBubble;
