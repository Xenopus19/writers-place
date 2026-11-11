import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useError from '../hooks/useError';
import { ApiError } from '../utils/ApiError';
import Error from './Error';
import { ErrorProvider } from './ErrorContext';

const cause = new ApiError({
  status: 400,
  code: 'VALIDATION_ERROR',
  message: 'Server detail',
  errors: [{ field: 'name', message: 'Required' }],
});

const Controls = () => {
  const { error, reportError } = useError();
  return (
    <>
      <button onClick={() => reportError('Something went wrong', cause)}>Report</button>
      <button onClick={() => reportError('Another error')}>Replace</button>
      {error?.cause instanceof ApiError && (
        <output>{`${error.cause.status} ${error.cause.code} ${error.cause.getFieldError('name')}`}</output>
      )}
    </>
  );
};

describe('error notifications', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const renderError = () => render(
    <ErrorProvider>
      <Controls />
      <Error />
    </ErrorProvider>,
  );

  it('shows the message and retains error data until the five-second timeout', () => {
    renderError();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Report' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByText('400 VALIDATION_ERROR Required')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4_999));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('restarts the timer when replacing even an identical message', () => {
    renderError();
    fireEvent.click(screen.getByRole('button', { name: 'Report' }));
    act(() => vi.advanceTimersByTime(4_000));
    fireEvent.click(screen.getByRole('button', { name: 'Report' }));
    act(() => vi.advanceTimersByTime(4_000));
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    fireEvent.click(screen.getByRole('button', { name: 'Replace' }));
    act(() => vi.advanceTimersByTime(4_999));
    expect(screen.getByRole('alert')).toHaveTextContent('Another error');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears timers on dismissal and unmount', () => {
    const { unmount } = renderError();
    fireEvent.click(screen.getByRole('button', { name: 'Report' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Report' }));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
