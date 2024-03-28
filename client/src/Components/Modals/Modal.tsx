interface Props
  extends PropsWithChildren<{
    isModalOpen: boolean;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
    canClose?: boolean;
    dialogClassName?: string;
    blackScreenClassName?: string;
  }> {}

import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { IoClose } from 'react-icons/io5';
import { twMerge } from 'tailwind-merge';

const Modal = ({
  children,
  isModalOpen,
  setIsModalOpen,
  dialogClassName,
  canClose = true,
  blackScreenClassName,
}: Props) => {
  const blackScreenRef = useRef(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = useCallback((event: any) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsModalOpen(false);
    }
  }, []);

  useEffect(() => {
    const bodyEl = document.querySelector('body');
    if (isModalOpen) {
      bodyEl?.classList.add('stop-scrolling');
    } else bodyEl?.classList.remove('stop-scrolling');
  }, [isModalOpen]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);

    return () =>
      document.removeEventListener('click', handleClickOutside, true);
  }, []);

  return (
    <>
      {isModalOpen && (
        <div
          role="black_screen"
          className={twMerge(
            'h-[100vh] w-[100vw] top-0 left-0 fixed bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-[100]',
            blackScreenClassName
          )}
          ref={blackScreenRef}
        >
          <div
            role="dialog"
            className={twMerge(
              'bg-white rounded-md px-6 py-6 max-w-[500px] w-full',
              dialogClassName
            )}
            ref={modalRef}
          >
            <div>
              {canClose && (
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(false);
                    }}
                    aria-label="btn_close"
                  >
                    <IoClose size={22} />
                  </button>
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
