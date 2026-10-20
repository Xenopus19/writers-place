import useUploadImage from "@/hooks/useUploadImage";
import useLogin from "@/hooks/useLogin";
import SignUpForm from "./SignUpForm";
import type { SignUpInfoType } from "./SignUpSchema";
import { useMutation } from "@tanstack/react-query";

import { handleApiError } from "@/utils/handleApiError";
import { useAppDispatch } from "@/store/hooks";
import { createUser } from "../../services/userService";

const SignUp = () => {
  const { uploadImage } = useUploadImage();
  const { login } = useLogin();
  const createUserMutation = useMutation({ mutationFn: createUser });
  const dispatch = useAppDispatch();

  const handleSubmit = async (data: SignUpInfoType) => {
    try {
      const key = await uploadImage(data.avatar[0]);
      await createUserMutation.mutateAsync({
        ...data,
        avatarUrl: `${import.meta.env.VITE_BUCKET_URL}/${key}`,
      });
      await login({ username: data.username, password: data.password });
    } catch (error) {
      handleApiError(error, dispatch, "Sign up failed. Consider changing your information and try again.");
    }
  };

  return (
    <section className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-background to-background p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl"
      />
      <div className="relative">
        <p className="mb-5 text-center text-2xl font-bold text-emerald-700 dark:text-emerald-400">
          Create account
        </p>
      </div>
      <SignUpForm onSubmit={handleSubmit} />
    </section>
  );
};

export default SignUp;