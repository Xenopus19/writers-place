
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useUser } from './components/UserContext'
import useLogin from './hooks/useLogin'

const AppLayout = () => {
  const user = useUser()
  const { logout } = useLogin()

  return (
    <div className="site-layout">
      <a
        href="#main-content"
        className="sr-only z-[200] rounded bg-[#454d3b] px-5 py-3 text-sm text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to main content
      </a>

      <header className="site-header">
        <Link to="/" className="site-logo">
          writers<span>place.</span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/articles" end>Explore</NavLink>
          <NavLink to="/search">Search</NavLink>
          {user && <NavLink to="/profile">Profile</NavLink>}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <Link to="/publish" className="publish-link">
                + Write
              </Link>

              <button
                type="button"
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

      <main id="main-content" tabIndex={-1} className="site-main outline-none">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <Link to="/" className="footer-logo">
            writers<span>place.</span>
          </Link>

          <p>A little space for big ideas.</p>

          <Link to="/articles">Explore stories <span aria-hidden="true">↗</span></Link>
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
