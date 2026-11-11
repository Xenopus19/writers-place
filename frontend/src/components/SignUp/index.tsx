import useUploadImage from "../../hooks/useUploadImage";
import SignUpForm from "./SignUpForm";
import type { SignUpInfoType } from "./SignUpSchema";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "../../services/userService";
import useLogin from "../../hooks/useLogin";
import { useState } from "react";
import { Link } from "react-router-dom";

const SignUp = () => {
  const uploadImageMutation = useUploadImage();
  const { login } = useLogin();
  const createUserMutation = useMutation({ mutationFn: createUser });
  const [error, setError] = useState<"signup" | "login" | null>(null);

  const handleSubmit = async (data: SignUpInfoType) => {
    let accountCreated = false;
    setError(null);
    try {
      const key = await uploadImageMutation.mutateAsync(data.avatar[0]);
      await createUserMutation.mutateAsync({
        ...data,
        avatarUrl: `${import.meta.env.VITE_BUCKET_URL}/${key}`,
      });
      accountCreated = true;
      const result = await login({ username: data.username, password: data.password });
      if (!result?.token) {
        throw new Error("Login response did not contain a token");
      }
    } catch (error) {
      console.error(error);
      setError(accountCreated ? "login" : "signup");
    }
  };

  return (
    <div className="bg-[#fcfbf9]">
      <section className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-[#e8e5de] bg-white p-6 sm:p-8">
        <div>
          <p className="mb-5 text-center text-2xl font-bold text-[#2d3a2e]">
            Create account
          </p>
        </div>
        <SignUpForm onSubmit={handleSubmit} disabled={error === "login"} />
        {error && (
          <p role="alert" className="mx-auto mt-4 max-w-md text-sm text-red-600">
            {error === "login" ? (
              <>Your account was created, but automatic login failed. <Link className="underline" to="/login">Log in</Link> to continue.</>
            ) : (
              "Sign up failed. Please try again."
            )}
          </p>
        )}
      </section>
    </div>
  );
};

export default SignUp;