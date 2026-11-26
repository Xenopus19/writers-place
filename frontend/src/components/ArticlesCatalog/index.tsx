import { ArticlesList } from './ArticlesList';

const ArticlesCatalog = () => {
  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <span className="catalog-eyebrow">DISCOVER STORIES</span>
        <h1>Articles Catalog</h1>
        <p className="catalog-subtitle">
          Explore thought-provoking articles, personal essays, and creative pieces from our community.
        </p>
      </div>

      <ArticlesList />
    </div>
  );
};

export default ArticlesCatalog;