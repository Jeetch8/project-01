import { useState } from 'react';
import NewMessageModal from '../Modals/NewMessageModal';
import { Button } from '../Global/Button';

const EmptyChatDisplay = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="h-screen flex items-center justify-center w-[620px] border-r-[1px] border-zinc-900">
        <div>
          <h1 className="text-[35px] font-extrabold">Select a message</h1>
          <p className="text-gray-500 w-[300px] mt-1">
            Choose from your existing conversations, start a new one, or just
            keep swimming.
          </p>
          <Button
            variant="ghost"
            className="bg-[#199BF0] hover:bg-[#1A8CD8] rounded-full mt-6 text-[18px] font-semibold"
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            New message
          </Button>
        </div>
      </div>
      <NewMessageModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

export default EmptyChatDisplay;
