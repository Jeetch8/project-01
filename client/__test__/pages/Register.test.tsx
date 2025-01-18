import { screen, render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PropsWithChildren } from 'react';
import userEvent from '@testing-library/user-event';
import { Server } from 'miragejs';
import { makeServer } from '../mocks/server';
import Register from '@/pages/Register';
import { vi } from 'vitest';

vi.mock('@/Components/Carousel/RegisterPageCarousel', () => ({
  default: () => <div data-testid="mock-register-carousel">Mock Carousel</div>,
}));

const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
};

vi.spyOn(Storage.prototype, 'getItem').mockResolvedValue('testtoken');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderRegisterPage = () => {
  const rendered = render(<Register />, { wrapper });
  const user = userEvent.setup();
  return {
    ...rendered,
    user,
  };
};

const renderPersonalInfoComponent = () => {
  const rendered = renderRegisterPage();
  return {
    ...rendered,
    firstNameField: screen.getByPlaceholderText(/first name/i),
    lastNameField: screen.getByPlaceholderText(/last name/i),
    dateOfBirthField: screen.getByLabelText(/date of birth/i),
    genderSelect: screen.getByRole('combobox'),
    nextBtn: screen.getByRole('button', { name: /next/i }),
  };
};

const fillPersonalInfoStep = async (
  user: ReturnType<typeof userEvent.setup>,
  firstNameField: HTMLElement,
  lastNameField: HTMLElement,
  dateOfBirthField: HTMLElement,
  genderSelect: HTMLElement,
  nextBtn: HTMLElement
) => {
  await user.type(firstNameField, 'John');

  await user.type(firstNameField, 'John');
  await user.type(lastNameField, 'Doe');
  await user.type(dateOfBirthField, '1990-01-01');
  await user.selectOptions(genderSelect, 'male');

  await user.click(nextBtn);
};

const fillProfileFormStep = async (
  user: ReturnType<typeof userEvent.setup>,
  usernameField: HTMLElement,
  nextBtn: HTMLElement
) => {
  await user.type(usernameField, 'testuser123');
  await user.click(nextBtn);
};

const renderProfileComponent = async () => {
  const {
    user,
    firstNameField,
    lastNameField,
    dateOfBirthField,
    genderSelect,
    nextBtn,
  } = renderPersonalInfoComponent();
  await fillPersonalInfoStep(
    user,
    firstNameField,
    lastNameField,
    dateOfBirthField,
    genderSelect,
    nextBtn
  );

  const profileComponent = {
    user,
    profileImageInput: screen.getByLabelText(/profile_img/i),
    usernameField: screen.getByPlaceholderText(/username/i),
    nextBtn: screen.getByRole('button', { name: /next/i }),
    backBtn: screen.getByRole('button', { name: /prev/i }),
    imagePreview: screen.getByRole('avatar_preview'),
    generateRandomBtn: screen.getByRole('button', { name: /generate random/i }),
  };

  return {
    ...profileComponent,
    fillProfileForm: () =>
      fillProfileFormStep(
        profileComponent.user,
        profileComponent.usernameField,
        profileComponent.nextBtn
      ),
  };
};

const renderSecurityCredentialsComp = async () => {
  const profileComponent = await renderProfileComponent();
  await profileComponent.fillProfileForm();

  return {
    ...profileComponent,
    emailField: screen.getByPlaceholderText(/email/i),
    passwordField: screen.getByPlaceholderText(/^password$/i),
    confirmPasswordField: screen.getByPlaceholderText(/confirm password/i),
    submitBtn: screen.getByRole('button', { name: /submit/i }),
  };
};

// Add this function after the renderSecurityCredentialsComp function
const fillSecurityCredentialsStep = async (
  user: ReturnType<typeof userEvent.setup>,
  emailField: HTMLElement,
  passwordField: HTMLElement,
  confirmPasswordField: HTMLElement,
  submitBtn: HTMLElement,
  {
    email,
    password,
    confirmPassword,
  }: { email: string; password: string; confirmPassword: string }
) => {
  await user.type(emailField, email);
  await user.type(passwordField, password);
  await user.type(confirmPasswordField, confirmPassword);
  await user.click(submitBtn);
};

describe('Testing Register page', () => {
  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.shutdown();
  });

  describe('Testing personal info component', () => {
    it('Should render main elements', () => {
      renderPersonalInfoComponent();
    });

    it('Should show error messages when fields are empty and Next is clicked', async () => {
      const { user, nextBtn } = renderPersonalInfoComponent();

      await user.click(nextBtn);

      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/date of birth is required/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/gender is required/i)).toBeInTheDocument();
    });

    it('Should not show error messages when fields are filled and Next is clicked', async () => {
      const {
        user,
        firstNameField,
        lastNameField,
        dateOfBirthField,
        genderSelect,
        nextBtn,
      } = renderPersonalInfoComponent();

      await fillPersonalInfoStep(
        user,
        firstNameField,
        lastNameField,
        dateOfBirthField,
        genderSelect,
        nextBtn
      );

      await user.click(nextBtn);

      expect(
        screen.queryByText(/first name is required/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/last name is required/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/date of birth is required/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/gender is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Testing profile Form Step component', () => {
    it('Should render main elements of profile step', async () => {
      await renderProfileComponent();
    });

    it('Should generate a random username when Generate random button is clicked', async () => {
      const { user, usernameField, generateRandomBtn } =
        await renderProfileComponent();

      expect(usernameField).toHaveValue('');

      await user.click(generateRandomBtn);

      await waitFor(() => {
        expect(usernameField).not.toHaveValue('');
        expect(usernameField).toBeDefined();
      });
    });

    it('Should show error message when username is empty and Next is clicked', async () => {
      const { user, usernameField, nextBtn } = await renderProfileComponent();
      await user.clear(usernameField);
      expect(usernameField).toHaveValue('');
      await user.click(nextBtn);
      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      });
    });

    it('Should not show error message when username is filled and Next is clicked', async () => {
      const { user, usernameField, nextBtn, fillProfileForm } =
        await renderProfileComponent();

      await fillProfileForm();

      expect(usernameField).toHaveValue('testuser123');
      expect(
        screen.queryByText(/username is required/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Testing Security Credentials component', () => {
    it('Should render main elements of security credentials step', async () => {
      const { emailField, passwordField, confirmPasswordField, submitBtn } =
        await renderSecurityCredentialsComp();

      expect(emailField).toBeInTheDocument();
      expect(passwordField).toBeInTheDocument();
      expect(confirmPasswordField).toBeInTheDocument();
      expect(submitBtn).toBeInTheDocument();
    });

    it('Should show error messages when fields are empty and Submit is clicked', async () => {
      const {
        user,
        emailField,
        passwordField,
        confirmPasswordField,
        submitBtn,
      } = await renderSecurityCredentialsComp();
      await user.clear(emailField);
      await user.clear(passwordField);
      await user.clear(confirmPasswordField);
      await user.click(submitBtn);
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(
          screen.getByText(/password confirmation is required/i)
        ).toBeInTheDocument();
      });
    });

    it('Should show error messages when invalid data is entered', async () => {
      const {
        user,
        emailField,
        passwordField,
        confirmPasswordField,
        submitBtn,
      } = await renderSecurityCredentialsComp();

      await fillSecurityCredentialsStep(
        user,
        emailField,
        passwordField,
        confirmPasswordField,
        submitBtn,
        {
          email: 'invalidemail',
          password: 'weak',
          confirmPassword: 'notmatching',
        }
      );
      await waitFor(() => {
        expect(screen.getByText(/email is not valid/i)).toBeInTheDocument();
        expect(
          screen.getByText(/password must be at least 8 characters long/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('Should not show error messages when valid data is entered', async () => {
      const {
        user,
        emailField,
        passwordField,
        confirmPasswordField,
        submitBtn,
      } = await renderSecurityCredentialsComp();

      await fillSecurityCredentialsStep(
        user,
        emailField,
        passwordField,
        confirmPasswordField,
        submitBtn,
        {
          email: 'valid@email.com',
          password: 'StrongPassword1!',
          confirmPassword: 'StrongPassword1!',
        }
      );
      await waitFor(() => {
        expect(
          screen.queryByText(/email is not valid/i)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/password must be at least 8 characters long/i)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/passwords do not match/i)
        ).not.toBeInTheDocument();
      });
    });
    describe('Testing form complete component', () => {
      it.only('Should render main elements of form complete step', async () => {
        const {
          user,
          emailField,
          passwordField,
          confirmPasswordField,
          submitBtn,
        } = await renderSecurityCredentialsComp();
        await fillSecurityCredentialsStep(
          user,
          emailField,
          passwordField,
          confirmPasswordField,
          submitBtn,
          {
            email: 'valid@email.com',
            password: 'StrongPassword1!',
            confirmPassword: 'StrongPassword1!',
          }
        );
        await user.click(submitBtn);
        await waitFor(() => {
          expect(
            screen.getByText(/registeration success/i)
          ).toBeInTheDocument();
          expect(screen.getByText(/email sent/i)).toBeInTheDocument();
        });
      });
    });
  });
});
