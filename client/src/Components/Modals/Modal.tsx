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

interface Props
  extends PropsWithChildren<{
    isModalOpen: boolean;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
    canClose?: boolean;
    dialogClassName?: string;
    blackScreenClassName?: string;
    header?: React.ReactNode;
  }> {}

const Modal = ({
  children,
  isModalOpen,
  setIsModalOpen,
  dialogClassName,
  canClose = true,
  blackScreenClassName,
  header,
}: Props) => {
  const blackScreenRef = useRef(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: any) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsModalOpen(false);
    }
  }, []);

  useEffect(() => {
    const bodyEl = document.body;
    if (isModalOpen) {
      bodyEl.style.overflow = 'hidden';
    } else {
      bodyEl.style.overflow = '';
    }

    return () => {
      bodyEl.style.overflow = '';
    };
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
              <div className="flex justify-between items-center mb-4">
                {header && <div className="flex-grow">{header}</div>}
                {canClose && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(false);
                    }}
                    aria-label="btn_close"
                    className="ml-auto"
                  >
                    <IoClose size={22} />
                  </button>
                )}
              </div>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
