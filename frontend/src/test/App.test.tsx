import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the heading', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ data: { name: 'Ada' } }) })),
    );
    render(<App />);
    expect(await screen.findByText('Writers Place')).toBeInTheDocument();
  });
});
