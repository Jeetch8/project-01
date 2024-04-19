import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Modal from '@/Components/Modals/Modal';

describe('Modal Component', () => {
  const mockSetIsModalOpen = vi.fn();

  const renderModal = (props = {}) => {
    const user = userEvent.setup();
    return {
      user,
      ...render(
        <Modal
          isModalOpen={true}
          setIsModalOpen={mockSetIsModalOpen}
          {...props}
        >
          <div>Modal Content</div>
        </Modal>
      ),
    };
  };

  beforeEach(() => {
    vi.spyOn(document.body.style, 'overflow', 'set');
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  it('should open the modal and hide window scrollbar', async () => {
    renderModal();

    await waitFor(() => {
      expect(screen.getByRole('dialog_modal')).toBeInTheDocument();
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  it('should close the modal and return window to original view', async () => {
    const { rerender } = renderModal();

    const closeButton = screen.getByLabelText('btn_close_modal');
    await userEvent.click(closeButton);

    rerender(
      <Modal isModalOpen={false} setIsModalOpen={mockSetIsModalOpen}>
        <div>Modal Content</div>
      </Modal>
    );

    await waitFor(() => {
      expect(mockSetIsModalOpen).toHaveBeenCalledWith(false);
      expect(document.body.style.overflow).toBe('');
      expect(screen.queryByRole('dialog_modal')).not.toBeInTheDocument();
    });
  });

  it('should display header if provided', () => {
    renderModal({ header: <h2>Modal Header</h2> });

    expect(screen.getByRole('dialog_modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Header')).toBeInTheDocument();
  });

  it('should close the modal when clicking on the black screen', async () => {
    const { user } = renderModal();

    const blackScreen = screen.getByRole('black_screen_modal');
    await user.click(blackScreen);

    await waitFor(() => {
      expect(mockSetIsModalOpen).toHaveBeenCalledWith(false);
      // We can't check for the absence of dialog_modal here because the Modal component
      // is not actually re-rendered in this test case. In a real scenario, the parent
      // component would re-render the Modal with isModalOpen set to false.
    });
  });

  it('should not render the modal when isModalOpen is false', () => {
    render(
      <Modal isModalOpen={false} setIsModalOpen={mockSetIsModalOpen}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByRole('dialog_modal')).not.toBeInTheDocument();
  });
});
