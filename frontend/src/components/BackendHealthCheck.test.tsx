import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../utils/api'
import BackendHealthCheck from './BackendHealthCheck'

vi.mock('../utils/api', () => ({
  default: { get: vi.fn() },
}))

describe('BackendHealthCheck', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(api.get).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits for a successful request before rendering its children', async () => {
    let resolveRequest: (value: { status: number }) => void = () => {
      throw new Error('Health check was not started')
    }
    vi.mocked(api.get).mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve
    }))

    const { container } = render(<BackendHealthCheck><p>App content</p></BackendHealthCheck>)

    expect(screen.getByRole('status')).toHaveTextContent('Please wait')
    const spinner = container.querySelector('[data-slot="spinner"]')
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
    expect(spinner).toHaveClass('motion-reduce:animate-none')
    expect(screen.queryByText('App content')).not.toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/health', expect.objectContaining({
      signal: expect.any(AbortSignal),
      timeout: 5000,
    }))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(61_000)
    })
    expect(screen.getByLabelText('Time waiting: 1 minutes 01 seconds')).toHaveTextContent('1:01')

    await act(async () => resolveRequest({ status: 200 }))
    expect(screen.getByText('App content')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot="spinner"]')).not.toBeInTheDocument()
  })

  it('retries failures and renders children after recovery', async () => {
    vi.mocked(api.get)
      .mockRejectedValueOnce(new Error('Backend unavailable'))
      .mockResolvedValueOnce({ status: 200 })

    render(<BackendHealthCheck><p>App content</p></BackendHealthCheck>)
    await act(async () => { await Promise.resolve() })
    expect(screen.getByText('Please wait')).toBeInTheDocument()
    expect(screen.queryByText('App content')).not.toBeInTheDocument()

    await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
    expect(api.get).toHaveBeenCalledTimes(2)
    expect(screen.getByText('App content')).toBeInTheDocument()
  })

  it('aborts pending requests and cancels retries on unmount', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Backend unavailable'))
    const { unmount } = render(<BackendHealthCheck><p>App content</p></BackendHealthCheck>)
    await act(async () => { await Promise.resolve() })
    const options = vi.mocked(api.get).mock.calls[0][1]

    unmount()
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000) })

    expect(options?.signal?.aborted).toBe(true)
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('ignores a response that arrives after unmounting', async () => {
    let resolveRequest: (value: { status: number }) => void = () => {
      throw new Error('Health check was not started')
    }
    vi.mocked(api.get).mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve
    }))
    const { unmount } = render(<BackendHealthCheck><p>App content</p></BackendHealthCheck>)
    const options = vi.mocked(api.get).mock.calls[0][1]

    unmount()
    await act(async () => resolveRequest({ status: 200 }))

    expect(options?.signal?.aborted).toBe(true)
    expect(screen.queryByText('App content')).not.toBeInTheDocument()
    expect(vi.getTimerCount()).toBe(0)
  })
})
