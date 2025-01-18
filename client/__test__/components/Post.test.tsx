import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import Post from '@/Components/Home/Post';
import { GlobalContextProvider } from '@/context/GlobalContext';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Server } from 'miragejs';
import { makeServer } from '../mocks/server';
import { PropsWithChildren } from 'react';
import { IFeedPost } from '@/types/interfaces';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      <GlobalContextProvider>{children}</GlobalContextProvider>
    </BrowserRouter>
  );
};

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn().mockReturnValue('token'),
    setItem: vi.fn(),
  },
});

describe('Post Component', () => {
  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
    const user = server.create('user');
    // const post = server.create('post', {
    //   creator: user.attrs,
    // });
  });

  afterEach(() => {
    server.delete('user');
    server.delete('post');
    server.shutdown();
    vi.clearAllMocks();
  });

  const renderPost = (post?: Partial<IFeedPost>) => {
    const user = userEvent.setup();
    const dbPost = { ...post, ...server.db.posts[0] };
    const utils = render(<Post post={dbPost} />, { wrapper });
    return {
      ...utils,
      user,
      mockPost: dbPost,
    };
  };

  it('renders post content correctly', () => {
    const { mockPost } = renderPost();
    expect(screen.getByText(mockPost.creator.full_name)).toBeInTheDocument();
    expect(
      screen.getByText(`@${mockPost.creator.username}`)
    ).toBeInTheDocument();
    expect(screen.getByText(mockPost.caption)).toBeInTheDocument();
    expect(
      screen.getByText(mockPost.likes_count.toString())
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockPost.comments_count.toString())
    ).toBeInTheDocument();
  });

  it('navigates to post detail page when clicking on post content', async () => {
    const { user, mockPost } = renderPost();
    const postContent = screen.getByText(mockPost.caption);
    await user.click(postContent);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/${mockPost.creator.username}/status/${mockPost.id}`
    );
  });

  it.skip('toggles like and updates likes count when like button is clicked', async () => {
    const { user } = renderPost({ liked: true });

    const likeButton = screen.getByLabelText('like-button');
    expect(screen.getByLabelText('liked-icon')).toBeInTheDocument();
    const likesCount = screen.getByText(
      server.db.posts[0].likes_count.toString()
    );

    await user.click(likeButton);

    await waitFor(() => {
      expect(screen.getByLabelText('unliked-icon')).toBeInTheDocument();
      expect(likesCount).toHaveTextContent(
        server.db.posts[0].likes_count.toString()
      );
    });
  });

  it('opens and closes comment modal', async () => {
    const { user } = renderPost();
    expect(screen.queryByText('Post your reply...')).not.toBeInTheDocument();
    const commentButton = screen.getByLabelText('comment-button');
    await user.click(commentButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog_modal')).toBeInTheDocument();
    });
    const closeButton = screen.getByLabelText('btn_close_modal');
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByLabelText('dialog_modal')).not.toBeInTheDocument();
    });
  });

  it.skip('toggles bookmark when bookmark button is clicked', async () => {
    const { user } = renderPost({ bookmarked: true });
    const bookmarkButton = screen.getByLabelText('bookmark-button');
    expect(screen.getByLabelText('bookmarked-icon')).toBeInTheDocument();
    expect(
      screen.queryByLabelText('unbookmarked-icon')
    ).not.toBeInTheDocument();
    await user.click(bookmarkButton);
    await waitFor(() => {
      expect(screen.getByLabelText('unbookmarked-icon')).toBeInTheDocument();
      expect(
        screen.queryByLabelText('bookmarked-icon')
      ).not.toBeInTheDocument();
    });
    await user.click(bookmarkButton);
    await waitFor(() => {
      expect(screen.getByLabelText('bookmarked-icon')).toBeInTheDocument();
      expect(
        screen.queryByLabelText('unbookmarked-icon')
      ).not.toBeInTheDocument();
    });
  });
});
