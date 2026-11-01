import { ArticlesList } from './ArticlesList';

const ArticlesCatalog = () => {
  const dummyArticles = [
    {
      id: 1,
      title: 'Article title 1',
      description: 'Short article description with interesting thoughts.',
      genres: ['Fiction', 'Drama'],
      likesCount: 12,
      createdAt: '2026-01-01',
      coverUrl: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
    },
    {
      id: 2,
      title: 'Article title 2',
      description: 'Short article description about culture and life.',
      genres: ['Culture', 'Essay'],
      likesCount: 24,
      createdAt: '2026-01-02',
      coverUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800',
    },
    {
      id: 3,
      title: 'Article title 3',
      description: 'Short article description on design patterns.',
      genres: ['Technology', 'Design'],
      likesCount: 45,
      createdAt: '2026-01-03',
      coverUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800',
    },
  ];

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <span className="catalog-eyebrow">DISCOVER STORIES</span>
        <h1>Articles Catalog</h1>
        <p className="catalog-subtitle">
          Explore thought-provoking articles, personal essays, and creative pieces from our community.
        </p>
      </div>

      <ArticlesList articles={dummyArticles} />
    </div>
  );
};

export default ArticlesCatalog;