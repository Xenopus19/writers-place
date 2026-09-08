import { useEffect, useState } from 'react'
import type { ApiResponse, User } from '@writers-place/shared'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/users/me')
      .then((res) => res.json() as Promise<ApiResponse<User>>)
      .then((body) => setUser(body.data))
      .catch(() => setError('Failed to reach backend'))
  }, [])

  return (
    <section>
      <h1>Writers Place</h1>
      {error && <p role="alert">{error}</p>}
      {user ? <p>You are welcomed</p> : <p>Loading user…</p>}
    </section>
  )
}

export default App
