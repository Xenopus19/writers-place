import { useQuery } from "@tanstack/react-query";
import { getArticles } from "../services/articleService";

const useArticles = () =>
  useQuery({
    queryKey: ["articles"],
    queryFn: getArticles,
  });

export default useArticles;
