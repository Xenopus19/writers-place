// frontend/src/components/ArticleSearch.tsx
// Пошук статей: семантичний (GET /api/articles/search) + фільтр за жанром (GET /api/articles?genre=).
// Схема: ввід → кнопка «Шукати» / Enter / debounce 5 с → запит на сервер → результат.

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useError from "../hooks/useError";

/* ---------- Типи (відповідають JSON бекенду) ---------- */
export interface Article {
  id: string;
  title: string;
  description: string;
  genres: string[];
  likesCount: number;
  createdAt?: string;
}

type Status = "idle" | "waiting" | "loading" | "success" | "error";

const DEBOUNCE_MS = 5000;
const SEARCH_LIMIT = 50; // максимум, який дозволяє searchArticlesSchema
const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? ""; // порожньо → Vite-проксі

/* ---------- API ---------- */
async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { signal });
  if (!res.ok) {
    // Бекенд повертає { status, code, message, errors? }
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Помилка сервера (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function fetchGenres(): Promise<string[]> {
  // Маршрут і формат уточнити за backend/requests/genres.get.rest
  const data = await request<Array<string | { name: string }>>("/api/genres");
  return data.map((g) => (typeof g === "string" ? g : g.name));
}

export async function searchArticles(
  query: string,
  genre: string | null,
  signal: AbortSignal
): Promise<Article[]> {
  const q = query.trim().slice(0, 500);

  if (q) {
    // Семантичний пошук. Жанру в API пошуку немає → фільтруємо результати на клієнті.
    const items = await request<Article[]>(
      `/api/articles/search?${new URLSearchParams({ q, limit: String(SEARCH_LIMIT) })}`,
      signal
    );
    return genre ? items.filter((a) => a.genres.includes(genre)) : items;
  }

  // Тільки жанр, без тексту — звичайний список з фільтром на сервері.
  return request<Article[]>(`/api/articles?${new URLSearchParams({ genre: genre ?? "" })}`, signal);
}

/* ---------- Хук ---------- */
export function useArticleSearch(onError?: (message: string, cause?: unknown) => void) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<Article[]>([]);
  const [progress, setProgress] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const clearTimers = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (tickRef.current) window.clearInterval(tickRef.current);
    timerRef.current = tickRef.current = null;
    setProgress(0);
  };

  const run = useCallback(async (q: string, g: string | null) => {
    clearTimers();
    abortRef.current?.abort();
    if (!q.trim() && !g) {
      setResults([]);
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");
    try {
      setResults(await searchArticles(q, g, controller.signal));
      setStatus("success");
    } catch (e) {
      if ((e as Error).name === "AbortError") return; // застарілий запит
      setStatus("error");
      onErrorRef.current?.((e as Error).message || "Не вдалося виконати пошук", e);
    }
  }, []);

  const onQueryChange = (value: string) => {
    setQuery(value);
    clearTimers();
    abortRef.current?.abort();
    if (!value.trim()) {
      run(value, genre);
      return;
    }
    setStatus("waiting");
    const start = Date.now();
    tickRef.current = window.setInterval(
      () => setProgress(Math.min((Date.now() - start) / DEBOUNCE_MS, 1)),
      100
    );
    timerRef.current = window.setTimeout(() => run(value, genre), DEBOUNCE_MS);
  };

  // Зміна жанру — окрема дія, шукаємо одразу.
  const selectGenre = (g: string) => {
    const next = genre === g ? null : g;
    setGenre(next);
    run(query, next);
  };

  const submit = () => run(query, genre);
  const reset = () => {
    setQuery("");
    setGenre(null);
    run("", null);
  };

  useEffect(
    () => () => {
      clearTimers();
      abortRef.current?.abort();
    },
    []
  );

  return { query, genre, status, results, progress, onQueryChange, selectGenre, submit, reset };
}

/* ---------- Компонент ---------- */
// onError: передайте reportError з useError(), щоб помилки показувались єдиним способом:
//   const { reportError } = useError();  <ArticleSearch onError={reportError} />
export default function ArticleSearch({ onError: onErrorProp }: { onError?: (m: string, c?: unknown) => void }) {
  const { reportError } = useError();
  const onError = onErrorProp ?? reportError;
  const s = useArticleSearch(onError);
  const [genres, setGenres] = useState<string[]>([]);
  const secondsLeft = Math.ceil((1 - s.progress) * (DEBOUNCE_MS / 1000));

  useEffect(() => {
    fetchGenres().then(setGenres).catch((e) => onError?.("Не вдалося завантажити жанри", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-serif text-4xl font-normal text-[#303328]">Search articles</h1>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          s.submit();
        }}
        className="flex gap-2"
      >
        <input
          type="search"
          value={s.query}
          maxLength={500}
          onChange={(e) => s.onQueryChange(e.target.value)}
          placeholder="What do you want to read about? For example: 'loneliness in a big city'"
          aria-label="Search articles"
          className="flex-1 rounded-full border border-stone-300 bg-white px-5 py-3 outline-none focus:ring-2 focus:ring-[#8a9470]"
        />
        <button
          type="submit"
          disabled={s.status === "loading"}
          className="rounded-full bg-[#434a37] px-6 py-3 text-white disabled:opacity-60"
        >
          Search
        </button>
      </form>

      {/* Статус: користувач завжди бачить, що сайт щось робить */}
      <div className="mt-3 min-h-[2.5rem]" aria-live="polite">
        {s.status === "waiting" && (
          <div>
            <p className="text-sm text-stone-600">
              Searching in {secondsLeft} s. Click "Search" to skip the wait.
            </p>
            <div className="mt-1 h-1 w-full overflow-hidden rounded bg-stone-200">
              <div
                className="h-full bg-[#8a9470] transition-[width] duration-100"
                style={{ width: `${s.progress * 100}%` }}
              />
            </div>
          </div>
        )}
        {s.status === "loading" && (
          <p className="flex items-center gap-2 text-sm text-stone-600">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-[#434a37]" />
            Searching articles…
          </p>
        )}
      </div>

      {/* Фільтр за жанром (один жанр, як в API) */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Genres">
        {genres.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={s.genre === g}
            onClick={() => s.selectGenre(g)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              s.genre === g
                ? "border-[#434a37] bg-[#434a37] text-white"
                : "border-stone-300 bg-white text-stone-700 hover:border-[#8a9470]"
            }`}
          >
            {g}
          </button>
        ))}
        {(s.genre || s.query) && (
          <button type="button" onClick={s.reset} className="px-2 text-sm text-stone-600 underline">
            Reset
          </button>
        )}
      </div>

      {/* Результати */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {s.status === "success" && s.results.length === 0 && (
          <p className="col-span-full text-stone-600">
            Nothing found. Try other topics or remove the genre filter.
          </p>
        )}
        {s.results.map((a) => (
          <Link
            key={a.id}
            to={`/articles/${a.id}`}
            className="rounded-xl border border-stone-200 bg-[#fcfaf8] p-4"
          >
            <p className="text-xs text-stone-600">{a.genres.join(", ")}</p>
            <h2 className="mt-1 font-serif text-lg">{a.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{a.description}</p>
            <p className="mt-3 text-xs text-stone-600">
              <span aria-hidden="true">♥</span> {a.likesCount} likes
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
