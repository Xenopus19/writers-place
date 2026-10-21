import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser } from '../services/userService';
import { TOKEN } from '../utils/localStorage';
import ProtectedPage from './ProtectedPage';
import { UserProvider } from './UserContext';

vi.mock('../services/userService', () => ({
  getCurrentUser: vi.fn(),
}));

describe('ProtectedPage', () => {
  beforeEach(() => {
    localStorage.removeItem(TOKEN);
    vi.mocked(getCurrentUser).mockReset();
  });

  const renderRoutes = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <MemoryRouter initialEntries={['/protected']}>
            <Routes>
              <Route
                path="/protected"
                element={
                  <ProtectedPage>
                    <p>Protected content</p>
                  </ProtectedPage>
                }
              />
              <Route path="/login" element={<p>Login page</p>} />
            </Routes>
          </MemoryRouter>
        </UserProvider>
      </QueryClientProvider>,
    );
  };

  it('redirects unauthenticated users to login', async () => {
    renderRoutes();

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('keeps the protected page while the current user is loading', async () => {
    localStorage.setItem(TOKEN, 'test-token');
    let resolveUser: (user: {
      id: string;
      username: string;
      name: string;
      about: string;
      avatarUrl: string;
    }) => void = () => {
      throw new Error('User query was not started');
    };
    vi.mocked(getCurrentUser).mockReturnValue(
      new Promise((resolve) => {
        resolveUser = resolve;
      }),
    );

    renderRoutes();

    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();

    resolveUser({
      id: 'user-1',
      username: 'Ada',
      name: 'Ada Lovelace',
      about: '',
      avatarUrl: '',
    });

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });
});
