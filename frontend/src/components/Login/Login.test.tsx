import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { loginUser } from '../../services/userService';
import ErrorNotification from '../Error';
import { ErrorProvider } from '../ErrorContext';
import Login from './index';

vi.mock('../../services/userService', () => ({
  loginUser: vi.fn(),
  getCurrentUser: vi.fn(),
}));

describe('Login', () => {
  it.each([
    ['a rejected request', undefined],
    ['a response without a token', { token: '', user: { id: '1', username: 'writer' } }],
  ])('reports %s instead of silently failing', async (_description, response) => {
    if (response) {
      vi.mocked(loginUser).mockResolvedValueOnce(response);
    } else {
      vi.mocked(loginUser).mockRejectedValueOnce(new Error('Login failed'));
    }
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ErrorProvider>
          <MemoryRouter><Login /></MemoryRouter>
          <ErrorNotification />
        </ErrorProvider>
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByPlaceholderText('Your username.'), { target: { value: 'writer' } });
    fireEvent.change(screen.getByPlaceholderText('Your password.'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Log in failed. Please try again.');
  });
});
