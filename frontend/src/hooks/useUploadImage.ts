import { useMutation } from "@tanstack/react-query";
import { uploadImage } from "../services/imageService";

const useUploadImage = () => useMutation({ mutationFn: uploadImage });

export default useUploadImage;