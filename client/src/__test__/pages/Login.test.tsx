import { screen, render, waitFor } from '@testing-library/react';
import Login from '@/pages/Login';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PropsWithChildren } from 'react';
import userEvent from '@testing-library/user-event';
import { mockErrorResponse } from '../utils';
import { AcceptedMethods } from '@/hooks/useFetch';
import { Server } from 'miragejs';
import { makeServer } from '../mocks/server';

const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
};

vi.spyOn(Storage.prototype, 'getItem').mockResolvedValue('access_token');
const localStorageSetItem = vi.spyOn(Storage.prototype, 'setItem');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderComponent = () => {
  const user = userEvent.setup();
  return {
    ...render(<Login />, { wrapper }),
    user,
    emailField: screen.getByPlaceholderText(/email/i),
    passwordField: screen.getByPlaceholderText(/password/i) as HTMLInputElement,
    submitBtn: screen.getByRole('button', { name: /submit/i }),
  };
};

describe('Testing Login page', () => {
  let server: Server;

  beforeEach(() => {
    vi.clearAllMocks();
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('Should render main elements', () => {
    renderComponent();
  });

  it('Should throw a required error if email is not provided', async () => {
    const { user, submitBtn } = renderComponent();
    await user.click(submitBtn);
    const errorPara = screen.getByRole('paragraph', {
      name: /error_status_email/i,
    });
    expect(errorPara).toBeInTheDocument();
    expect(errorPara).toHaveTextContent(/email is required/i);
  });

  it.each([
    { emailToTest: 'test' },
    { emailToTest: 'test@klasd' },
    { emailToTest: 'testsadsad@' },
  ])(
    'Should show error if email is invalid - ($emailToTest)',
    async ({ emailToTest }) => {
      const { user, emailField, submitBtn } = renderComponent();
      await user.type(emailField, emailToTest);
      await user.click(submitBtn);
      const errorPara = screen.getByRole('paragraph', {
        name: /error_status_email/i,
      });
      expect(errorPara).toBeInTheDocument();
      expect(errorPara).toHaveTextContent(/email is not valid/i);
    }
  );

  it('Should throw an error if password is not provided', async () => {
    const { submitBtn, emailField, user } = renderComponent();
    await user.type(emailField, 'test@gmail.com');
    await user.click(submitBtn);
    const errorPara = screen.getByRole('paragraph', {
      name: /error_status_password/i,
    });
    expect(errorPara).toBeInTheDocument();
    expect(errorPara).toHaveTextContent(/password is required/i);
  });

  it.each([
    { password: 'test1' },
    { password: 'testasdf' },
    { password: 'test1asdas' },
    { password: 'test1@asdsaa' },
    { password: 'test@asdsaa' },
  ])(
    'Should throw an error if password does not match the requirements - ($password)',
    async ({ password }) => {
      const { submitBtn, emailField, passwordField, user } = renderComponent();
      await user.type(emailField, 'test@gmail.com');
      await user.type(passwordField, password);
      await user.click(submitBtn);
      const errorPara = screen.getByRole('paragraph', {
        name: /error_status_password/i,
      });
      expect(errorPara).toBeInTheDocument();
      expect(errorPara).toHaveTextContent(
        /password must be at least 8 characters long/i
      );
    }
  );

  it('Should show loader when submitting login data', async () => {
    const { emailField, passwordField, user, submitBtn } = renderComponent();
    await user.type(emailField, 'test@gmail.com');
    await user.type(passwordField, 'Test@12asa');
    await user.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByRole('loader')).toBeInTheDocument();
    });
  });

  it.each([{ type: 'email not found' }, { type: 'password is incorrect' }])(
    'Should toast an error when recieved from server if $type',
    async ({ type }) => {
      await mockErrorResponse({
        server,
        route: '/auth/login/local',
        msg: type,
        method: AcceptedMethods.POST,
      });
      const { emailField, passwordField, user, submitBtn } = renderComponent();
      await user.type(emailField, 'test@gmail.com');
      await user.type(passwordField, 'Test@12asa');
      await user.click(submitBtn);
      await waitFor(() => {
        const toast = screen.getByText(RegExp(type, 'i'));
        expect(toast).toBeInTheDocument();
      });
    }
  );

  it('Should toast and navigate to home after login success', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { emailField, passwordField, user, submitBtn } = renderComponent();
    await user.type(emailField, 'test@gmail.com');
    await user.type(passwordField, 'Test@12asa');
    await user.click(submitBtn);
    await waitFor(() => {
      const successToast = screen.getAllByText(/Logged in/i)[0];
      expect(successToast).toBeInTheDocument();
    });
    vi.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(localStorageSetItem).toHaveBeenCalledTimes(1);
      expect(localStorageSetItem).toHaveBeenCalledWith(
        'access_token',
        'access_token'
      );
      expect(mockNavigate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    vi.useRealTimers();
  });

  describe('Testing Forgot password modal', () => {
    const renderModalComponent = async () => {
      const { user, ...rest } = renderComponent();
      const forgotPassword = screen.getByText(/forgot your password/i);
      await user.click(forgotPassword);
      const dialog = screen.getByRole('dialog');
      const emailBox = screen.getByPlaceholderText('Enter your email');
      const submitBtn = screen.getAllByRole('button', { name: /submit/i })[1];
      return { dialog, user, rest, emailBox, submitBtn };
    };

    it('Should open a modal after clicking reset password', async () => {
      await renderModalComponent();
    });

    it('Should throw error if email is not provided', async () => {
      const { user, submitBtn } = await renderModalComponent();
      await user.click(submitBtn);
      const errorPara = await screen.findByRole('paragraph', {
        name: /error_status_email/i,
      });
      expect(errorPara).toBeInTheDocument();
      expect(errorPara).toHaveTextContent(/email is required/i);
    });

    it.each([
      { emailToTest: 'test' },
      { emailToTest: 'test@klasd' },
      { emailToTest: 'testsadsad@' },
      { emailToTest: 'test123@sad' },
    ])(
      'Should throw error if invalid email provided',
      async ({ emailToTest }) => {
        const { user, emailBox, submitBtn } = await renderModalComponent();
        await user.type(emailBox, emailToTest);
        await user.click(submitBtn);
        const errorPara = await screen.findByRole('paragraph', {
          name: /error_status_email/i,
        });
        expect(errorPara).toBeInTheDocument();
        expect(errorPara).toHaveTextContent(/invalid email/i);
      }
    );

    it('Should show success message', async () => {
      const { submitBtn, emailBox, user } = await renderModalComponent();
      await user.type(emailBox, 'jeet@gmail.com');
      await user.click(submitBtn);
      await waitFor(() => {
        screen.getByRole('img');
        screen.getByText(/Email has been sent/i);
      });
    });
  });
});
