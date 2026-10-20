import axios from "axios";
import api from "../utils/api";

interface ImageUploadUrlResponse {
  uploadUrl: string;
  key: string;
}

export const uploadImage = async (file: File): Promise<string> => {
  const { data } = await api.post<ImageUploadUrlResponse>("/images", {
    fileName: file.name,
    fileType: file.type,
  });

  await axios.put(data.uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });

  return data.key;
};
