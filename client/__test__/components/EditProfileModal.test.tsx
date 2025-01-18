import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import EditProfileModal from '@/Components/Modals/EditProfileModal';
import { Server } from 'miragejs';
import { makeServer } from '../mocks/server';
import { IAuthProvider, IUser } from '@/types/interfaces';
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

const mockUser: IUser = {
  id: '1',
  full_name: 'John Doe',
  email: 'john@example.com',
  profile_img: 'profile.jpg',
  banner_img: 'banner.jpg',
  bio: 'Test bio',
  date_of_birth: '1990-01-01',
  signup_date: '2023-01-01',
  auth_provider: IAuthProvider.LOCAL,
  email_verified: true,
  first_name: 'John',
  last_name: 'Doe',
  username: 'johndoe',
};

const mockSetIsOpen = vi.fn();

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'mocked-url');
});

afterAll(() => {
  vi.restoreAllMocks();
});

const renderEditProfileModal = () => {
  const user = userEvent.setup();
  return {
    user,
    ...render(
      <EditProfileModal setIsOpen={mockSetIsOpen} modalIsOpen={true} />,
      { wrapper }
    ),
  };
};

describe('EditProfileModal', () => {
  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
    vi.clearAllMocks();
  });

  it('Should render all the elements', () => {
    renderEditProfileModal();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByAltText('banner')).toBeInTheDocument();
    expect(screen.getByAltText('profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    expect(screen.getByLabelText('Birth date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('Should render the loading state', async () => {
    const { user } = renderEditProfileModal();
    const fullNameInput = screen.getByLabelText('Full Name');
    const saveButton = screen.getByRole('button', { name: 'Save' });

    // Change input to make form dirty
    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'Jane Doe');

    // Trigger form submission
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByLabelText('loading')).toBeInTheDocument();
    });
  });

  it('Should render the disabled button initially', () => {
    renderEditProfileModal();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });

  it('Should enable the button when form is dirty', async () => {
    const { user } = renderEditProfileModal();
    const fullNameInput = screen.getByLabelText('Full Name');
    const saveButton = screen.getByRole('button', { name: 'Save' });

    expect(saveButton).toBeDisabled();

    // Change input to make form dirty
    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'Jane Doe');

    expect(saveButton).not.toBeDisabled();
  });

  it('Should show toast after success and close the modal', async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });
    const { user } = renderEditProfileModal();
    const fullNameInput = screen.getByLabelText('Full Name');
    const saveButton = screen.getByRole('button', { name: 'Save' });

    // Change input to make form dirty
    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'Jane Doe');

    // Submit form
    await user.click(saveButton);

    // Advance time to trigger toast
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Profile updated')).toBeInTheDocument();
    });

    // Wait for modal to close
    await waitFor(
      () => {
        expect(mockSetIsOpen).toHaveBeenCalledWith(false);
      },
      { timeout: 2500 }
    );
    vi.useRealTimers();
  });

  it('Should handle image upload for profile picture', async () => {
    const { user } = renderEditProfileModal();
    const file = new File(['profile'], 'profile.png', { type: 'image/png' });
    const profileImageInput = screen.getByLabelText('Profile image');

    await user.upload(profileImageInput, file);

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it('Should handle image upload for banner image', async () => {
    const { user } = renderEditProfileModal();
    const file = new File(['banner'], 'banner.png', { type: 'image/png' });
    const bannerImageInput = screen.getByLabelText('Banner image');

    await user.upload(bannerImageInput, file);

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });
});
