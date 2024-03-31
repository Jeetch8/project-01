import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import PostExtraAsset, {
  PostExtraAssetProps,
} from '@/Components/Home/CreateNewPost/PostExtraAsset';
import { GlobalContextProvider } from '@/context/GlobalContext';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Server } from 'miragejs';
import { makeServer } from '@/__test__/mocks/server';
import { PropsWithChildren } from 'react';

// Updated mock for gif-picker-react
vi.mock('gif-picker-react', async () => {
  const actual = await vi.importActual('gif-picker-react');
  return {
    ...actual,
    default: ({ onGifClick }: { onGifClick: (gif: any) => void }) => (
      <button onClick={() => onGifClick({ url: 'mocked-gif-url' })}>
        Select GIF
      </button>
    ),
    Theme: {
      DARK: 'dark',
      LIGHT: 'light',
    },
  };
});

vi.mock('emoji-picker-react', () => ({
  default: ({ onEmojiClick }: { onEmojiClick: (emojiObject: any) => void }) => (
    <button onClick={() => onEmojiClick({ emoji: '😀' })}>Select Emoji</button>
  ),
}));

const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      <GlobalContextProvider>{children}</GlobalContextProvider>
    </BrowserRouter>
  );
};

const renderPostExtraAsset = (
  extraAssetsState: string[] = [],
  props: Partial<PostExtraAssetProps> = {}
) => {
  const mockHandleAddExtraAssets = vi.fn();
  const mockHandleAddEmoji = vi.fn();
  const user = userEvent.setup();
  const utils = render(
    <PostExtraAsset
      extraAssetsState={extraAssetsState}
      handleAddExtraAssets={mockHandleAddExtraAssets}
      handleAddEmoji={mockHandleAddEmoji}
      {...props}
    />,
    { wrapper }
  );

  return {
    ...utils,
    user,
    mockHandleAddExtraAssets,
    mockHandleAddEmoji,
    imageInput: utils.queryByLabelText('imageInput'),
    gifButton: utils.queryByLabelText('gif-button'),
    listButton: utils.queryByLabelText('poll-button'),
    emojiButton: utils.queryByLabelText('emoji-button'),
    calendarButton: utils.queryByLabelText('calendar-button'),
    locationButton: utils.queryByLabelText('location-button'),
  };
};

describe('PostExtraAsset', () => {
  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
    // Mock URL.createObjectURL
    URL.createObjectURL = vi.fn(() => 'mocked-url');
  });

  afterEach(() => {
    server.shutdown();
    vi.restoreAllMocks();
  });

  it('renders all main elements', () => {
    renderPostExtraAsset();
  });

  it('updates extraAssetsState when an image is uploaded', async () => {
    const { getByLabelText, mockHandleAddExtraAssets } = renderPostExtraAsset();
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = getByLabelText('imageInput') as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(mockHandleAddExtraAssets).toHaveBeenCalledWith(['mocked-url']);
  });

  it('does not update extraAssetsState when max assets are reached', async () => {
    const { getByLabelText, mockHandleAddExtraAssets } = renderPostExtraAsset([
      '1',
      '2',
      '3',
      '4',
    ]);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = getByLabelText('imageInput') as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(mockHandleAddExtraAssets).not.toHaveBeenCalled();
  });

  it('adds GIF URL to extraAssetsState when a GIF is selected', async () => {
    const { gifButton, mockHandleAddExtraAssets, user } =
      renderPostExtraAsset();
    if (gifButton) await user.click(gifButton);
    const selectGifButton = await screen.findByText('Select GIF');
    await user.click(selectGifButton);
    await waitFor(() => {
      expect(mockHandleAddExtraAssets).toHaveBeenCalledWith(['mocked-gif-url']);
    });
  });

  it('does not add GIF when max assets are reached', async () => {
    const { gifButton, mockHandleAddExtraAssets, user } = renderPostExtraAsset([
      '1',
      '2',
      '3',
      '4',
    ]);
    if (gifButton) await user.click(gifButton);
    await waitFor(() => {
      const selectGifButton = screen.queryByText('Select GIF');
      expect(selectGifButton).not.toBeInTheDocument();
    });
    expect(mockHandleAddExtraAssets).not.toHaveBeenCalled();
  });

  it('adds emoji to input when an emoji is selected', async () => {
    const { emojiButton, mockHandleAddEmoji, user } = renderPostExtraAsset();
    if (emojiButton) await user.click(emojiButton);
    const selectEmojiButton = await screen.findByText('Select Emoji');
    await user.click(selectEmojiButton);
    expect(mockHandleAddEmoji).toHaveBeenCalledWith('😀');
  });

  it('renders all elements when all props are true', () => {
    renderPostExtraAsset();
  });

  it('does not render image input when showImage is false', () => {
    renderPostExtraAsset([], { showImage: false });
    expect(screen.queryByLabelText('imageInput')).not.toBeInTheDocument();
  });

  it('does not render GIF button when showGif is false', () => {
    renderPostExtraAsset([], { showGif: false });
    expect(screen.queryByLabelText('gif-button')).not.toBeInTheDocument();
  });

  it('does not render poll button when showList is false', () => {
    renderPostExtraAsset([], { showList: false });
    expect(screen.queryByLabelText('poll-button')).not.toBeInTheDocument();
  });

  it('does not render emoji button when showEmoji is false', () => {
    renderPostExtraAsset([], { showEmoji: false });
    expect(screen.queryByLabelText('emoji-button')).not.toBeInTheDocument();
  });

  it('does not render calendar button when showCalendar is false', () => {
    renderPostExtraAsset([], { showCalendar: false });
    expect(screen.queryByLabelText('calendar-button')).not.toBeInTheDocument();
  });

  it('does not render location button when showLocation is false', () => {
    renderPostExtraAsset([], { showLocation: false });
    expect(screen.queryByLabelText('location-button')).not.toBeInTheDocument();
  });

  it('renders no elements when all show props are false', () => {
    const { container } = renderPostExtraAsset([], {
      showImage: false,
      showGif: false,
      showList: false,
      showEmoji: false,
      showCalendar: false,
      showLocation: false,
    });
    expect(container.firstChild).toBeNull();
  });
});
