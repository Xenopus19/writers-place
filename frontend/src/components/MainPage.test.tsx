import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser } from '../services/userService';
import { TOKEN } from '../utils/localStorage';
import { UserProvider } from './UserContext';
import MainPage from './MainPage';

vi.mock('../services/userService', () => ({
  getCurrentUser: vi.fn(),
}));

describe('MainPage', () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN, 'test-token');
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'user-1',
      username: 'Ada',
      name: 'Ada Lovelace',
      about: '',
      avatarUrl: '',
    });
  });

  it('logs out the signed-in user', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        </UserProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Welcome, Ada!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(localStorage.getItem(TOKEN)).toBeNull();
    expect(await screen.findByText('Please log in.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();
  });
});
