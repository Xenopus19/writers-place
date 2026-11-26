import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createArticle } from "../services/articleService";

const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createArticle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["articles"] }),
  });
};

export default useCreateArticle;
