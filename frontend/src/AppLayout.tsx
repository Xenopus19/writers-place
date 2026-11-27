
import { useState } from 'react'
import { Button } from './components/ui/button'
import { Link, Outlet } from 'react-router-dom'
import { useUser } from './components/UserContext'
import useLogin from './hooks/useLogin'

const AppLayout = () => {
  const user = useUser()
  const { logout } = useLogin()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="site-layout">

      <header className="site-header">
        <Link to="/" className="site-logo">
          writers<span>place.</span>
        </Link>

        <nav className="site-nav">
          <Link to="/">Home</Link>
          <Link to="/articles">Explore</Link>
         <Link to="/search">Search</Link>
          {user && <Link to="/profile">Profile</Link>}
        </nav>

        <div
          className={`site-menu${isMenuOpen ? ' is-open' : ''}`}
          id="primary-navigation"
        >
          <nav className="site-nav">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/articles" onClick={() => setIsMenuOpen(false)}>Explore</Link>
            {user && <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>}
          </nav>

          <div className="header-actions">
            {user ? (
              <>
                <Button asChild>
                  <Link to="/publish" onClick={() => setIsMenuOpen(false)}>+ Write</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMenuOpen(false)
                    logout()
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-link" onClick={() => setIsMenuOpen(false)}>
                  Log in
                </Link>
                <Button asChild>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <Link to="/" className="footer-logo">
            writers<span>place.</span>
          </Link>

          <p>A little space for big ideas.</p>

          <Link to="/articles">Explore stories ↗</Link>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Writers Place</span>
          <span>Made for people who love words.</span>
        </div>
      </footer>

    </div>
  )
}

export default AppLayout
