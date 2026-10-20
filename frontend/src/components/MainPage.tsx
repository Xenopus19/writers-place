import { Link } from 'react-router-dom';
import useLogin from '../hooks/useLogin';
import { Button } from './ui/button';
import { useUser } from './UserContext';

const MainPage = () => {
  const user = useUser();
  const { logout } = useLogin();

  return (
    <div>
      {user ? <p>Welcome, {user.username}!</p> : <p>Please log in.</p>}
      <h1>Writers Place</h1>
      {user && <Button onClick={logout}>Log out</Button>}
      <nav>
        <ul>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/articles">Articles</Link>
          </li>
          <li>
            <Link to="/signup">Sign up</Link>
          </li>
          <li>
            <Link to="/login">Log in</Link>
          </li>
          <li>
            <Link to="/publish">Publish</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MainPage;
