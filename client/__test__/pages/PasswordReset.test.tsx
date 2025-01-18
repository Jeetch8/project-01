import { screen, render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PropsWithChildren } from 'react';
import userEvent from '@testing-library/user-event';
import { Server } from 'miragejs';
import { makeServer } from '../mocks/server';
import PasswordReset from '@/pages/PasswordReset';

const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
};

vi.spyOn(Storage.prototype, 'getItem').mockResolvedValue('token');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderComponent = async () => {
  const user = await userEvent.setup();
  return {
    ...render(<PasswordReset />, { wrapper }),
    user,
    passwordField: screen.getByPlaceholderText(
      'New password'
    ) as HTMLInputElement,
    confirmPasswordField: screen.getByPlaceholderText(
      'Confirm new password'
    ) as HTMLInputElement,
    submitBtn: screen.getByRole('button', { name: /change/i }),
  };
};

describe('Testing Password reset page', () => {
  let server: Server;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    vi.useRealTimers();
    server.shutdown();
  });

  it('Should render main elements', () => {
    renderComponent();
  });

  it('Should throw error if password is not provided', async () => {
    const { user, submitBtn } = await renderComponent();
    await user.click(submitBtn);
    const errorPasswordPara = screen.getByRole('paragraph', {
      name: /error_status_password/i,
    });
    const errorConfirmPasswordPara = screen.getByRole('paragraph', {
      name: /error_status_confirmPassword/i,
    });
    expect(errorPasswordPara).toBeInTheDocument();
    expect(errorPasswordPara).toHaveTextContent(/Password is required/i);
    expect(errorConfirmPasswordPara).toBeInTheDocument();
    expect(errorConfirmPasswordPara).toHaveTextContent(
      /Password confirmation is required/i
    );
  });

  it('Should throw error if password is not strong', async () => {
    const { user, passwordField, submitBtn } = await renderComponent();
    await user.type(passwordField, 'test');
    await user.click(submitBtn);
    const errorPasswordPara = screen.getByRole('paragraph', {
      name: /error_status_password/i,
    });
    expect(errorPasswordPara).toBeInTheDocument();
    expect(errorPasswordPara).toHaveTextContent(/Password is not strong/i);
  });

  it('Should throw error if passwords do not match', async () => {
    const { user, passwordField, confirmPasswordField, submitBtn } =
      await renderComponent();
    await user.type(passwordField, 'Test@1234');
    await user.type(confirmPasswordField, 'Test@12345');
    await user.click(submitBtn);
    const errorConfirmPasswordPara = screen.getByRole('paragraph', {
      name: /error_status_confirmPassword/i,
    });
    expect(errorConfirmPasswordPara).toBeInTheDocument();
    expect(errorConfirmPasswordPara).toHaveTextContent(
      /Passwords do not match/i
    );
  });

  it('Should throw error if token is not provided', async () => {
    const { user, passwordField, confirmPasswordField, submitBtn } =
      await renderComponent();
    await user.type(passwordField, 'Test@1234');
    await user.type(confirmPasswordField, 'Test@1234');
    await user.click(submitBtn);
    const errorToast = await screen.findByRole('status');
    expect(errorToast).toBeInTheDocument();
    expect(errorToast).toHaveTextContent(/Token is required/i);
    vi.advanceTimersByTime(5000);
  });

  it('Should reset password', async () => {
    const { user, passwordField, confirmPasswordField, submitBtn } =
      await renderComponent();
    await user.type(passwordField, 'Test@1234');
    await user.type(confirmPasswordField, 'Test@1234');
    await user.click(submitBtn);
    await waitFor(() => {
      const successToast = screen.getByRole('status');
      expect(successToast).toBeInTheDocument();
    });
    vi.advanceTimersByTime(5000);
  });
});
