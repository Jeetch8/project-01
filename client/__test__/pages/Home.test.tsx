import { render } from '@testing-library/react';
import { describe, it, beforeEach, afterEach } from 'vitest';
import Home from '@/pages/Home';
import { GlobalContextProvider } from '@/context/GlobalContext';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Server } from 'miragejs';
import { makeServer } from '../mocks/server';
import { PropsWithChildren } from 'react';

const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter>
      <GlobalContextProvider>{children}</GlobalContextProvider>
    </BrowserRouter>
  );
};

const renderHome = () => {
  const user = userEvent.setup();
  return {
    ...render(<Home />, { wrapper }),
    user,
  };
};

describe('Home', () => {
  let server: Server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('renders without crashing', () => {
    renderHome();
  });
});
