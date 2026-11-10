import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';
import api from '../utils/api';

vi.mock('../utils/api', () => ({
  default: { get: vi.fn() },
}));

describe('App', () => {
  it('renders the app after the backend health check succeeds', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ status: 200 });

    render(<App />);

    expect(await screen.findByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(api.get).toHaveBeenCalledWith('/health', expect.objectContaining({ timeout: 5000 }));
  });
});
