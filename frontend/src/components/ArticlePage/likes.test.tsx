import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../utils/api';
import ArticlePage from './index';
import { ApiError } from '../../utils/ApiError';
import { ErrorProvider } from '../ErrorContext';
import ErrorNotification from '../Error';
import { useUser } from '../UserContext';

vi.mock('../../utils/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('../UserContext', () => ({ useUser: vi.fn() }));

const article = {
  id: 'article-1',
  title: 'Test article',
  description: 'Description',
  text: 'Article text',
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  genres: [],
  likesCount: 3,
  likedByMe: false,
};

const user = {
  id: 'user-2',
  username: 'ada',
  name: 'Ada',
  about: '',
  avatarUrl: '',
};

const mockArticle = (data: typeof article) => {
  vi.mocked(api.get).mockImplementation(async (url) => {
    if (url === '/articles/article-1') return { data };
    if (url === '/articles/article-1/comments') return { data: [] };
    throw new Error(`Unexpected GET ${url}`);
  });
};

const renderArticle = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <MemoryRouter initialEntries={['/articles/article-1']}>
          <Routes>
            <Route path="/articles/:id" element={<ArticlePage />} />
            <Route path="/login" element={<p>Login page</p>} />
          </Routes>
        </MemoryRouter>
        <ErrorNotification />
      </ErrorProvider>
    </QueryClientProvider>,
  );
};

describe('article likes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useUser).mockReturnValue(user);
    mockArticle(article);
  });

  it('likes an article optimistically and applies the server count', async () => {
    let resolvePost: (value: { data: { likesCount: number } }) => void = () => {
      throw new Error('POST was not started');
    };
    vi.mocked(api.post).mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );
    renderArticle();

    fireEvent.click(await screen.findByRole('button', { name: /Like story \(3\)/ }));

    const likedButton = await screen.findByRole('button', { name: /Liked \(4\)/ });
    expect(likedButton).toHaveAttribute('aria-pressed', 'true');
    expect(likedButton).toHaveAttribute('aria-disabled', 'true');
    expect(api.post).toHaveBeenCalledWith('/articles/article-1/likes');
    expect(api.post).toHaveBeenCalledTimes(1);

    resolvePost({ data: { likesCount: 10 } });

    expect(await screen.findByRole('button', { name: /Liked \(10\)/ })).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('removes a like when the article is already liked', async () => {
    mockArticle({ ...article, likedByMe: true });
    vi.mocked(api.delete).mockResolvedValue({ data: { likesCount: 2 } });
    renderArticle();

    fireEvent.click(await screen.findByRole('button', { name: /Liked \(3\)/ }));

    expect(await screen.findByRole('button', { name: /Like story \(2\)/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(api.delete).toHaveBeenCalledWith('/articles/article-1/likes');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('restores the previous state and reports an error when liking fails', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError({ status: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }),
    );
    renderArticle();

    fireEvent.click(await screen.findByRole('button', { name: /Like story \(3\)/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to like the story. Please try again.',
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Like story \(3\)/ })).toHaveAttribute(
        'aria-pressed',
        'false',
      ),
    );
  });

  it('sends guests to the login page instead of liking', async () => {
    vi.mocked(useUser).mockReturnValue(null);
    renderArticle();

    fireEvent.click(await screen.findByRole('button', { name: /Like story \(3\)/ }));

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });
});
