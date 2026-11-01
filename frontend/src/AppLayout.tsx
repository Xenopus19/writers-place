
import { Link, Outlet } from 'react-router-dom'
import { useUser } from './components/UserContext'
import useLogin from './hooks/useLogin'

const AppLayout = () => {
  const user = useUser()
  const { logout } = useLogin()

  return (
    <div className="site-layout">

      <header className="site-header">
        <Link to="/" className="site-logo">
          writers<span>place.</span>
        </Link>

        <nav className="site-nav">
          <Link to="/">Home</Link>
          <Link to="/articles">Explore</Link>
          {user && <Link to="/profile">Profile</Link>}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <Link to="/publish" className="publish-link">
                + Write
              </Link>

              <button
                onClick={logout}
                className="logout-button"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">
                Log in
              </Link>

              <Link to="/signup" className="signup-button">
                Get started
              </Link>
            </>
          )}
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
