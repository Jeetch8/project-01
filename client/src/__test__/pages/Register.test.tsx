import { screen, render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PropsWithChildren } from 'react';
import userEvent from '@testing-library/user-event';
import { mockErrorResponse } from '../utils';
import { AcceptedMethods } from '@/hooks/useFetch';
import { Server } from 'miragejs';
import { makeServer } from '../mocks/server';
import Register from '@/pages/Register';

const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
};

vi.spyOn(Storage.prototype, 'getItem').mockResolvedValue('testtoken');
const localStorageSetItem = vi.spyOn(Storage.prototype, 'setItem');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Testing Register page', () => {
  const renderComponent = () => {
    const rendererd = render(<Register />, { wrapper });
    const user = userEvent.setup();
    const nameField = screen.getByPlaceholderText(/name/i);
    const emailField = screen.getByPlaceholderText(/email/i);
    const passwordField = screen.getByPlaceholderText('Password');
    const confirmPasswordField =
      screen.getByPlaceholderText('Confirm password');
    const dateOfBirth = screen.getByPlaceholderText('dd/mm/yyyy');
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    const fillForm = async () => {
      await user.type(nameField, 'test@gmail.com');
      await user.type(emailField, 'test@gmail.com');
      await user.type(passwordField, 'Test@12asa');
      await user.type(confirmPasswordField, 'Test@12asa');
      await user.type(dateOfBirth, '2020-05-10');
    };
    return {
      ...rendererd,
      user,
      nameField,
      emailField,
      passwordField,
      confirmPasswordField,
      submitBtn,
      fillForm,
    };
  };

  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
    vi.clearAllMocks();
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

  it('Should throw an error if confirm password is not provided', async () => {
    const { submitBtn, emailField, user, passwordField } = renderComponent();
    await user.type(emailField, 'test@gmail.com');
    await user.type(passwordField, 'Test@12asa');
    await user.click(submitBtn);
    const errorPara = screen.getByRole('paragraph', {
      name: /error_status_confirmPassword/i,
    });
    expect(errorPara).toBeInTheDocument();
    expect(errorPara).toHaveTextContent(/password confirmation is required/i);
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

  it('Should throw an error if passwords do not match', async () => {
    const { submitBtn, emailField, user, passwordField, confirmPasswordField } =
      renderComponent();
    await user.type(emailField, 'test@gmail.com');
    await user.type(passwordField, 'Test@12asa');
    await user.type(confirmPasswordField, 'Test@12');
    await user.click(submitBtn);
    const errorPara = screen.getByRole('paragraph', {
      name: /error_status_confirmPassword/i,
    });
    expect(errorPara).toBeInTheDocument();
    expect(errorPara).toHaveTextContent(/Passwords do not match/i);
  });

  it('Should show loader when submitting login data', async () => {
    const { fillForm, user, submitBtn } = renderComponent();
    await fillForm();
    await user.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByRole('loader')).toBeInTheDocument();
    });
  });

  it('Should toast an error when error recieved from server', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockErrorResponse({
      server,
      route: '/auth/register/local',
      msg: 'Email already exist',
      status: 409,
      method: AcceptedMethods.POST,
    });
    const { user, submitBtn, fillForm } = renderComponent();
    await fillForm();
    await user.click(submitBtn);
    await waitFor(() => {
      const toast = screen.getByText(RegExp('email already exist', 'i'));
      expect(toast).toBeInTheDocument();
    });
    vi.advanceTimersByTime(5000);
    vi.useRealTimers();
  });

  it('Should toast and open email sent modal', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { fillForm, user, submitBtn } = renderComponent();
    await fillForm();
    await user.click(submitBtn);
    const successToast = await screen.findByText(/Registeration success/i);
    expect(successToast).toBeInTheDocument();
    vi.advanceTimersByTime(2000);
    const modal = await screen.findByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText(/email verify/i)).toBeInTheDocument();
    vi.useFakeTimers();
  });
});
