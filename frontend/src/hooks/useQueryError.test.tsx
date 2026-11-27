import { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorNotification from '../components/Error';
import { ErrorProvider } from '../components/ErrorContext';
import useQueryError from './useQueryError';

const QueryFailure = ({ updatedAt }: { updatedAt: number }) => {
  useQueryError('failure', updatedAt, true, 'Failed to load.');
  return null;
};

describe('useQueryError', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('reports once per failure even after rerenders and StrictMode effects', () => {
    const app = (updatedAt: number) => (
      <StrictMode>
        <ErrorProvider>
          <QueryFailure updatedAt={updatedAt} />
          <ErrorNotification />
        </ErrorProvider>
      </StrictMode>
    );
    const { rerender } = render(app(1));
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load.');
    act(() => vi.advanceTimersByTime(4_000));
    rerender(app(1));
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    rerender(app(2));
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load.');
  });
});
