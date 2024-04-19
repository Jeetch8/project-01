import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CommentPostModal from '@/Components/Modals/CommentPostModal';
import { Server } from 'miragejs';
import { makeServer } from '../mocks/server';
import { IFeedPost } from '@/utils/interfaces';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PropsWithChildren } from 'react';

const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
};

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn().mockReturnValue('test'),
    setItem: vi.fn(),
  },
});
const mockSetIsModalOpen = vi.fn();
describe('CommentPostModal', () => {
  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
    server.create('post', {
      creator: server.create('user').attrs,
    });
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  beforeAll(() => {
    global.URL.createObjectURL = vi.fn(() => 'mocked-url');
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const renderCommentPostModal = () => {
    const user = userEvent.setup();
    const post = server.db.posts[0];
    return {
      user,
      ...render(
        <CommentPostModal
          isOpen={true}
          post={post}
          setIsModalOpen={mockSetIsModalOpen}
        />,
        { wrapper }
      ),
      mockPost: post,
    };
  };

  it('Should render all the elements', () => {
    const { mockPost } = renderCommentPostModal();
    expect(screen.getByText(mockPost.creator.full_name)).toBeInTheDocument();
    expect(screen.getAllByText(`@${mockPost.creator.username}`)).toHaveLength(
      2
    );
    expect(screen.getByText(mockPost.caption)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Post your reply...')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reply' })).toBeInTheDocument();
  });

  it('Should render the loading state', async () => {
    const { user } = renderCommentPostModal();
    const commentInput = screen.getByPlaceholderText('Post your reply...');
    const replyButton = screen.getByRole('button', { name: 'Reply' });

    await user.type(commentInput, 'Test comment');
    await user.click(replyButton);

    await waitFor(() => {
      expect(screen.getByLabelText('loading')).toBeInTheDocument();
    });
  });

  it('Should render the disabled button initially', () => {
    renderCommentPostModal();
    const replyButton = screen.getByRole('button', { name: 'Reply' });
    expect(replyButton).toBeDisabled();
  });

  it('Should enable the button when comment is not empty', async () => {
    const { user } = renderCommentPostModal();
    const commentInput = screen.getByPlaceholderText('Post your reply...');
    const replyButton = screen.getByRole('button', { name: 'Reply' });

    expect(replyButton).toBeDisabled();

    await user.type(commentInput, 'Test comment');

    expect(replyButton).not.toBeDisabled();
  });

  it.only('Should show toast after success and close the modal', async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });
    // vi.advanceTimersByTime(5000);
    const { user } = renderCommentPostModal();
    const commentInput = screen.getByPlaceholderText('Post your reply...');
    const replyButton = screen.getByRole('button', { name: 'Reply' });

    await user.type(commentInput, 'Test comment');
    await user.click(replyButton);

    await waitFor(() => {
      expect(screen.getByText('Commented on post')).toBeInTheDocument();
    });
    vi.advanceTimersByTime(5000);
    expect(screen.queryByRole('dialog_modal')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('Should handle adding emoji to comment', async () => {
    const { user } = renderCommentPostModal();
    const commentInput = screen.getByPlaceholderText('Post your reply...');

    // Assuming there's an emoji button with aria-label "Add emoji"
    const emojiButton = screen.getByLabelText('Add emoji');

    await user.click(emojiButton);

    // Assuming clicking the emoji button adds a smiley face emoji
    expect(commentInput).toHaveValue('😊');
  });

  it('Should handle adding extra assets', async () => {
    const { user } = renderCommentPostModal();
    const file = new File(['image'], 'image.png', { type: 'image/png' });

    // Assuming there's an input for uploading images with aria-label "Upload image"
    const imageInput = screen.getByLabelText('Upload image');

    await user.upload(imageInput, file);

    // Assuming the uploaded image is displayed with alt text "Uploaded image"
    expect(screen.getByAltText('Uploaded image')).toBeInTheDocument();
  });
});
