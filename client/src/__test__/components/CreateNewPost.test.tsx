import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import CreateNewPost from '@/Components/Home/CreateNewPost/CreateNewPost';
import { GlobalContextProvider } from '@/context/GlobalContext';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Server } from 'miragejs';
import { makeServer } from '@/__test__/mocks/server';
import { PropsWithChildren } from 'react';

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn().mockReturnValue('token'),
  },
});

vi.mock('@/Components/Home/CreateNewPost/PostExtraAsset', () => ({
  default: ({
    handleAddExtraAssets,
  }: {
    handleAddExtraAssets: (assets: string[]) => void;
  }) => (
    <div data-testid="mocked-post-extra-asset">
      <button onClick={() => handleAddExtraAssets(['mocked-image-url'])}>
        Upload Image
      </button>
    </div>
  ),
}));

// Mock MediaAssetsPreview component
vi.mock(
  '@/Components/Home/CreateNewPost/ExtraAssets/MediaAssetsPreview',
  () => ({
    default: ({ extraAssetsState }: { extraAssetsState: string[] }) => (
      <div data-testid="media-assets-preview">
        {extraAssetsState.map((asset, index) => (
          <img key={index} src={asset} alt={`Preview ${index}`} />
        ))}
      </div>
    ),
  })
);

const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      <GlobalContextProvider>{children}</GlobalContextProvider>
    </BrowserRouter>
  );
};

const renderCreateNewPost = () => {
  const mockFetchHomeFeed = vi.fn();
  const user = userEvent.setup();
  const utils = render(<CreateNewPost fetchHomeFeed={mockFetchHomeFeed} />, {
    wrapper,
  });

  return {
    ...utils,
    user,
    mockFetchHomeFeed,
    avatarPreview: utils.getByRole('avatar_preview'),
    audienceSelection: utils.getByText('Everyone'),
    textArea: utils.getByPlaceholderText(
      "What's happening?"
    ) as HTMLTextAreaElement,
    postButton: utils.getByRole('button', { name: 'Post' }),
    createThreadIcon: utils.getByLabelText('create-thread-icon'),
    mediaAssetsPreview: utils.queryByTestId('media-assets-preview'),
    mockedPostExtraAsset: utils.getByTestId('mocked-post-extra-asset'),
  };
};

describe('Testing CreateNewPost', () => {
  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('renders all main elements', () => {
    const {
      avatarPreview,
      audienceSelection,
      textArea,
      postButton,
      createThreadIcon,
      mockedPostExtraAsset,
    } = renderCreateNewPost();

    expect(avatarPreview).toBeInTheDocument();
    expect(audienceSelection).toBeInTheDocument();
    expect(textArea).toBeInTheDocument();
    expect(postButton).toBeInTheDocument();
    expect(createThreadIcon).toBeInTheDocument();
    expect(mockedPostExtraAsset).toBeInTheDocument();
  });

  it('disables post button when text area is empty', () => {
    const { postButton } = renderCreateNewPost();
    expect(postButton).toBeDisabled();
  });

  it('enables post button when text area is not empty', async () => {
    const { textArea, postButton, user } = renderCreateNewPost();
    await user.type(textArea, 'Hello, world!');
    expect(postButton).toBeEnabled();
  });

  it('shows uploaded image below text area', async () => {
    const { getByText, getByTestId } = renderCreateNewPost();

    const uploadButton = getByText('Upload Image');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      const mediaPreview = getByTestId('media-assets-preview');
      const uploadedImage = mediaPreview.querySelector('img');
      expect(uploadedImage).toBeInTheDocument();
      expect(uploadedImage).toHaveAttribute('src', 'mocked-image-url');
    });
  });

  it('calls fetchHomeFeed when post is submitted successfully', async () => {
    const { textArea, postButton, user, mockFetchHomeFeed } =
      renderCreateNewPost();

    await user.type(textArea, 'Test post');
    await user.click(postButton);

    await waitFor(() => {
      expect(mockFetchHomeFeed).toHaveBeenCalled();
    });
  });
});
