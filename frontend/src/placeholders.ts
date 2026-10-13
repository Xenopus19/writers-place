import type { Article, Comment, User } from './types'

export const placeholderUser: User = {
  id: '1',
  username: 'jane_doe',
  name: 'Jane Doe',
  about: 'Lorem ipsum about the author.',
  avatarUrl: 'https://placehold.co/80',
}

export const placeholderArticle: Article = {
  id: '1',
  title: 'Article title',
  description: 'Short article description.',
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
  userId: '1',
  createdAt: '2026-01-01',
  genres: ['Fiction', 'Drama'],
  likes: 12,
}

export const placeholderArticles: Article[] = [1, 2, 3, 4].map((n) => ({
  ...placeholderArticle,
  id: String(n),
  title: `Article title ${n}`,
}))

export const placeholderComments: Comment[] = [1, 2].map((n) => ({
  id: String(n),
  createdAt: '2026-01-02',
  text: `Placeholder comment ${n}.`,
  articleId: '1',
  userId: '1',
}))
