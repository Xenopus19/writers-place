import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import useCreateArticle from "../../hooks/useCreateArticle";
import useGenres from "../../hooks/useGenres";
import { ApiError } from "../../utils/ApiError";

const publishArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(255, "Title must be 255 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(500, "Description must be 500 characters or fewer."),
  text: z.string().trim().min(1, "Article text is required."),
  genres: z.array(z.string()).min(1, "Select at least one genre"),
});

type PublishArticleFormData = z.infer<typeof publishArticleSchema>;

const getServerErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to publish the article.";
};

const PublishArticle = () => {
  const createArticleMutation = useCreateArticle();
  const {
    data: genres = [],
    error: genresError,
    isError: isGenresError,
    isLoading: isGenresLoading,
  } = useGenres();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PublishArticleFormData>({
    resolver: zodResolver(publishArticleSchema),
    defaultValues: {
      title: "",
      description: "",
      text: "",
      genres: [],
    },
    shouldFocusError: true,
  });

  const handleServerError = (error: unknown) => {
    setServerError(null);
    if (error instanceof ApiError && error.errors?.length) {
      let hasFieldError = false;
      for (const fieldError of error.errors) {
        switch (fieldError.field) {
          case "title":
            setError("title", { type: "server", message: fieldError.message });
            hasFieldError = true;
            break;
          case "description":
            setError("description", {
              type: "server",
              message: fieldError.message,
            });
            hasFieldError = true;
            break;
          case "text":
            setError("text", { type: "server", message: fieldError.message });
            hasFieldError = true;
            break;
          case "genres":
            setError("genres", { type: "server", message: fieldError.message });
            hasFieldError = true;
            break;
        }
      }

      if (hasFieldError) {
        return;
      }
    }

    setServerError(getServerErrorMessage(error));
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold">Publish an article</h1>

      <form
        className="space-y-6"
        onSubmit={handleSubmit((data) => {
          clearErrors();
          setServerError(null);
          createArticleMutation.mutate(data, {
            onSuccess: () => reset(),
            onError: handleServerError,
          });
        })}
      >
        <div className="space-y-2">
          <Label htmlFor="article-title">Title</Label>
          <Input
            id="article-title"
            className="h-11 text-base md:text-base"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "article-title-error" : undefined}
            {...register("title")}
          />
          {errors.title && (
            <p
              id="article-title-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="article-description">Description</Label>
          <Input
            id="article-description"
            className="h-11 text-base md:text-base"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "article-description-error" : undefined
            }
            {...register("description")}
          />
          {errors.description && (
            <p
              id="article-description-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="article-text">Article text</Label>
          <Textarea
            id="article-text"
            className="min-h-40 text-base md:text-base"
            aria-invalid={Boolean(errors.text)}
            aria-describedby={errors.text ? "article-text-error" : undefined}
            {...register("text")}
          />
          {errors.text && (
            <p
              id="article-text-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.text.message}
            </p>
          )}
        </div>

        <fieldset
          aria-invalid={Boolean(errors.genres)}
          aria-describedby={errors.genres ? "article-genres-error" : undefined}
          className="space-y-2"
        >
          <legend className="text-sm font-medium">Genres</legend>
          {isGenresLoading && <p role="status">Loading genres…</p>}
          {isGenresError && (
            <p role="alert" className="text-sm text-destructive">
              {getServerErrorMessage(genresError)}
            </p>
          )}
          {!isGenresLoading &&
            !isGenresError &&
            genres.map((genre) => {
              const id = `article-genre-${genre.id}`;
              return (
                <div key={genre.id} className="flex items-center gap-2">
                  <input
                    id={id}
                    type="checkbox"
                    value={genre.name}
                    {...register("genres")}
                  />
                  <Label htmlFor={id}>{genre.name}</Label>
                </div>
              );
            })}
          {errors.genres && (
            <p
              id="article-genres-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.genres.message}
            </p>
          )}
        </fieldset>

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}

        {createArticleMutation.isSuccess && (
          <p role="status" className="text-sm text-foreground">
            Article published successfully.
          </p>
        )}

        <Button
          type="submit"
          disabled={createArticleMutation.isPending}
          className="w-full sm:w-auto"
        >
          {createArticleMutation.isPending ? "Publishing…" : "Publish article"}
        </Button>
      </form>
    </div>
  );
};

export default PublishArticle