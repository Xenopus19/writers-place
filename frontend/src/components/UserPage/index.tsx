import { Link } from 'react-router-dom';
import useLogin from '../../hooks/useLogin';
import { useUser } from '../UserContext';


const UserPage = () => {
  const user = useUser();
  const { logout } = useLogin();

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-avatar-wrapper">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'}
            alt={user.username}
            className="profile-avatar"
          />
        </div>

        <div className="profile-info">
          <span className="profile-eyebrow">AUTHOR PROFILE</span>
          <h1>{user.name || user.username}</h1>
          <p className="profile-username">{user.username}</p>
          
          {user.about ? (
            <p className="profile-bio">{user.about}</p>
          ) : (
            <p className="profile-bio text-muted">No bio provided yet.</p>
          )}

          <div className="profile-actions">
            <button onClick={logout} className="logout-button">
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content-section">
        <h2 className="section-title">My Articles</h2>
        <div className="empty-articles">
          <p>You haven't published any stories yet.</p>
          <Link to="/publish" className="button-dark" style={{ marginTop: '15px', display: 'inline-flex' }}>
            Write your first story ↗
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserPage;