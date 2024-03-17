import { screen, render, waitFor } from '@testing-library/react';
import { BrowserRouter, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PropsWithChildren } from 'react';
import userEvent from '@testing-library/user-event';
import { mockErrorResponse } from '../utils';
import { AcceptedMethods } from '@/hooks/useFetch';
import { Server } from 'miragejs';
import { makeServer } from '../mocks/server';
import VerifyingEmail from '@/pages/VerifyingEmail';

const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
};

vi.spyOn(Storage.prototype, 'getItem').mockResolvedValue('token');
const localStorageSetItem = vi.spyOn(Storage.prototype, 'setItem');
const mockSearchGet = vi.fn();

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [
      {
        get: mockSearchGet,
      },
      mockSearchGet,
    ],
  };
});

const renderComponent = () => {
  return {
    ...render(<VerifyingEmail />, { wrapper }),
  };
};

describe('Testing Verifying email page', () => {
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

  it('Should throw error if token not found in url', async () => {
    await renderComponent();
    expect(screen.getByText(/token not found/i)).toBeInTheDocument();
  });

  it('Should throw error if token is malformed', async () => {
    mockSearchGet.mockReturnValue('token');
    mockErrorResponse({
      server,
      method: AcceptedMethods.PATCH,
      route: '/auth/verify-email',
      status: 400,
      msg: 'Invalid token',
    });
    await renderComponent();
    expect(
      await screen.findByText(/error verifying email/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/invalid token/i)).toBeInTheDocument();
  });

  it('Should verify email if token is valid', async () => {
    mockSearchGet.mockReturnValue('token');
    await renderComponent();
    expect(await screen.findByText(/email verified/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith('/');
    });
  });
});
