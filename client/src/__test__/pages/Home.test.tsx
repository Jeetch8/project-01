import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import Home from '@/pages/Home';
import CreateNewPost from '@/Components/Home/CreateNewPost/CreateNewPost';
import { GlobalContextProvider } from '@/context/GlobalContext';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Server } from 'miragejs';
import { makeServer } from '@/__test__/mocks/server';
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
