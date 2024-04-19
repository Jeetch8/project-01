import { useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { HashLoader } from 'react-spinners';
import { useSocketContext } from '@/context/SocketContext';
import dayjs from 'dayjs';
import GroupChatBubble from './ChatBubble/GroupChatBubble';
import PrivateChatBubble from './ChatBubble/PrivateChatBubble';

const ChatDisplayBox = () => {
  const { currentRoom } = useSocketContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentRoom]);

  const isGroupChat = currentRoom?.roomType === 'group';
  const todaysDate = new Date();
  return (
    <div
      className="flex-grow overflow-y-auto px-4 pt-4 no-scroll-container"
      id="scrollableDiv"
    >
      <InfiniteScroll
        dataLength={currentRoom?.chatHistory.length || 0}
        next={() => {}}
        hasMore={false}
        loader={
          <div className="flex justify-center items-center p-5">
            <HashLoader color="#fff" />
          </div>
        }
        key={currentRoom?.chatHistory.length}
        inverse={true}
        style={{ display: 'flex', flexDirection: 'column-reverse' }}
        scrollableTarget="scrollableDiv"
      >
        {currentRoom?.chatHistory?.map((message, index) => {
          const creationDate = dayjs(message.createdAt);
          const prevMessage = currentRoom?.chatHistory[index - 1] || todaysDate;
          const diff = creationDate.diff(dayjs(prevMessage?.createdAt), 'day');
          return (
            <>
              {diff !== 0 && (
                <div className="flex justify-center my-4 text-xs text-gray-500 w-full">
                  {creationDate.format('MMM D h:mm A')}
                </div>
              )}
              {isGroupChat ? (
                <GroupChatBubble key={message.id} message={message} />
              ) : (
                <PrivateChatBubble message={message} />
              )}
            </>
          );
        })}
      </InfiniteScroll>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatDisplayBox;
