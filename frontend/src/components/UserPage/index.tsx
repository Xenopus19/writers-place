import useLogin from '../../hooks/useLogin';
import useArticles from '../../hooks/useArticles';
import ArticleCard from '../ArticleCard';
import { useUser } from '../UserContext';

const UserPage = () => {
  const user = useUser();
  const { logout } = useLogin();
  const {
    data: articles = [],
    error,
    isError,
    isLoading,
  } = useArticles();

  if (!user) {
    return null;
  }

  const userArticles = articles.filter(
    (article) => String(article.userId) === String(user.id),
  );

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
        {isLoading ? (
          <p role="status">Loading articles…</p>
        ) : isError ? (
          <p role="alert">
            {error instanceof Error ? error.message : 'Unable to load articles.'}
          </p>
        ) : userArticles.length === 0 ? (
          <div className="empty-articles">
            <p>You haven't published any stories yet.</p>
            <a href="/publish" className="button-dark" style={{ marginTop: '15px', display: 'inline-flex' }}>
              Write your first story ↗
            </a>
          </div>
        ) : (
          <div className="catalog-grid">
            {userArticles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                excerpt={article.description}
                image="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800"
                tag=""
                href={`/articles/${article.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;