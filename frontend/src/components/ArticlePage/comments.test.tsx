import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../utils/api';
import ArticlePage from './index';
import { ApiError } from '../../utils/ApiError';
import { ErrorProvider } from '../ErrorContext';
import ErrorNotification from '../Error';

vi.mock('../../utils/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const article = {
  id: 'article-1',
  title: 'Test article',
  description: 'Description',
  text: 'Article text',
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  genres: [],
  likesCount: 0,
};

const comment = {
  id: 'comment-1',
  articleId: 'article-1',
  userId: 'user-1',
  text: 'Hello world',
  createdAt: '2026-01-01T00:00:00.000Z',
  user: { id: 'user-1', username: 'ada', name: 'Ada', avatarUrl: '' },
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

describe('article comments', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === '/articles/article-1') return { data: article };
      if (url === '/articles/article-1/comments') return { data: [] };
      throw new Error(`Unexpected GET ${url}`);
    });
  });

  it('posts trimmed text, prevents duplicate submissions, and refreshes the list', async () => {
    let resolvePost: (value: { data: { data: typeof comment } }) => void = () => {
      throw new Error('POST was not started');
    };
    vi.mocked(api.post).mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );
    renderArticle();
    expect(await screen.findByText(/No comments yet/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Comment'), {
      target: { value: '  Hello world  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/articles/article-1/comments', {
        text: 'Hello world',
      }),
    );
    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    expect(screen.getByLabelText('Comment')).toBeDisabled();
    expect(api.post).toHaveBeenCalledTimes(1);

    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === '/articles/article-1') return { data: article };
      if (url === '/articles/article-1/comments') return { data: [comment] };
      throw new Error(`Unexpected GET ${url}`);
    });
    resolvePost({ data: { data: comment } });

    expect(await screen.findByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByLabelText('Comment')).toHaveValue('');
    expect(api.get).toHaveBeenCalledWith('/articles/article-1/comments');
  });

  it.each(['', '   ', 'x'.repeat(151)])(
    'rejects invalid text before making a request',
    async (text) => {
      renderArticle();
      fireEvent.change(screen.getByLabelText('Comment'), { target: { value: text } });
      fireEvent.click(screen.getByRole('button', { name: 'Send' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        text.length > 150 ? 'at most 150 characters' : 'Enter a comment',
      );
      expect(api.post).not.toHaveBeenCalled();
    },
  );

  it('accepts a 150-character comment', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: comment } });
    renderArticle();
    const text = 'x'.repeat(150);
    fireEvent.change(screen.getByLabelText('Comment'), { target: { value: text } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/articles/article-1/comments', { text }),
    );
  });

  it('keeps the draft and allows retry after a failed request', async () => {
    vi.mocked(api.post)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: { data: comment } });
    renderArticle();
    fireEvent.change(screen.getByLabelText('Comment'), {
      target: { value: 'My draft' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to post comment',
    );
    expect(screen.getByLabelText('Comment')).toHaveValue('My draft');
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(screen.getByLabelText('Comment')).toHaveValue(''));
    expect(api.post).toHaveBeenCalledTimes(2);
  });

  it('offers login when the server rejects authentication', async () => {
    const error = new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    vi.mocked(api.post).mockRejectedValue(error);
    renderArticle();
    fireEvent.change(screen.getByLabelText('Comment'), {
      target: { value: 'My draft' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByRole('link', { name: 'log in' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByLabelText('Comment')).toHaveValue('My draft');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(screen.getByRole('link', { name: 'log in' })).toBeInTheDocument();
  });

  it('reports an article load failure and allows retry', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === '/articles/article-1') throw new Error('Article unavailable');
      return { data: [] };
    });
    renderArticle();
    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load the article.');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(screen.getByRole('button', { name: 'Retry loading article' })).toBeInTheDocument();
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === '/articles/article-1') return { data: article };
      return { data: [] };
    });
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading article' }));
    expect(await screen.findByText('Test article')).toBeInTheDocument();
  });

  it('reports a comments load failure and allows retry', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === '/articles/article-1') return { data: article };
      throw new Error('Comments unavailable');
    });
    renderArticle();
    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load comments.');
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === '/articles/article-1') return { data: article };
      return { data: [] };
    });
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading comments' }));
    expect(await screen.findByText(/No comments yet/)).toBeInTheDocument();
  });
});
