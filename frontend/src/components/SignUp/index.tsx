import useUploadImage from "../../hooks/useUploadImage";
import SignUpForm from "./SignUpForm";
import type { SignUpInfoType } from "./SignUpSchema";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "../../services/userService";

const SignUp = () => {
  const uploadImageMutation = useUploadImage();
  // const { login } = useLogin();
  const createUserMutation = useMutation({ mutationFn: createUser });

  const handleSubmit = async (data: SignUpInfoType) => {
    try {
      const key = await uploadImageMutation.mutateAsync(data.avatar[0]);
      const user = await createUserMutation.mutateAsync({
        ...data,
        avatarUrl: `${import.meta.env.VITE_BUCKET_URL}/${key}`,
      });
      console.log("User created successfully", user);
      // await login({ username: data.username, password: data.password });
    } catch (error) {
      console.error(error);
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