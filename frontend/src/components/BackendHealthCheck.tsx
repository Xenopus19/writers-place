import { useEffect, useState } from 'react'
import api from '../utils/api'
import { Spinner } from './ui/spinner'

const RETRY_DELAY_MS = 2_000
const REQUEST_TIMEOUT_MS = 2_000

const BackendHealthCheck = ({ children }: { children: React.ReactNode }) => {
  const [healthy, setHealthy] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const startedAt = Date.now()
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    const clockTimer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)

    const checkHealth = async () => {
      try {
        await api.get('/health', {
          signal: controller.signal,
          timeout: REQUEST_TIMEOUT_MS,
        })
        if (!controller.signal.aborted) {
          clearInterval(clockTimer)
          setHealthy(true)
        }
      } catch {
        if (!controller.signal.aborted) {
          retryTimer = setTimeout(checkHealth, RETRY_DELAY_MS)
        }
      }
    }

    void checkHealth()

    return () => {
      controller.abort()
      clearInterval(clockTimer)
      clearTimeout(retryTimer)
    }
  }, [])

  if (healthy) {
    return <>{children}</>
  }

  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = String(elapsedSeconds % 60).padStart(2, '0')

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f6f0] px-6 text-[#303328]">
      <div className="flex flex-col items-center text-center">
        <Spinner aria-hidden="true" className="mb-7 size-10 text-[#899273] motion-reduce:animate-none" />
        <h1 role="status" className="font-serif text-3xl font-normal sm:text-4xl">Please wait</h1>
        <p className="mt-4 font-mono text-sm text-[#73746a]" aria-label={`Time waiting: ${minutes} minutes ${seconds} seconds`}>
          {minutes}:{seconds}
        </p>
      </div>
    </main>
  )
}

export default BackendHealthCheck
