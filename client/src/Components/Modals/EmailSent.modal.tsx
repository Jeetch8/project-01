interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

import { Dispatch, SetStateAction } from 'react';
import Modal from './Modal';

const EmailSentModal = ({ isModalOpen, setIsModalOpen }: Props) => {
  return (
    <Modal
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      canClose={false}
    >
      <div className="text-black text-center mb-5 mt-3">
        <h1 className="text-xl font-semibold text-center">Email verify</h1>
        <p className="mt-6">
          Please check your email and click the to verify your email address
        </p>
      </div>
    </Modal>
  );
};

export default EmailSentModal;
