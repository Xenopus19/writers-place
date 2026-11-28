import { useQuery } from "@tanstack/react-query";
import { getGenres } from "../services/genreService";

const useGenres = () =>
  useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

export default useGenres;
