import useUploadImage from "../../hooks/useUploadImage";
import SignUpForm from "./SignUpForm";
import type { SignUpInfoType } from "./SignUpSchema";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "../../services/userService";
import useLogin from "../../hooks/useLogin";
import { useState } from "react";
import { Link } from "react-router-dom";
import useError from "../../hooks/useError";

const SignUp = () => {
  const uploadImageMutation = useUploadImage();
  const { login } = useLogin();
  const createUserMutation = useMutation({ mutationFn: createUser });
  const [accountCreated, setAccountCreated] = useState(false);
  const { reportError } = useError();

  const handleSubmit = async (data: SignUpInfoType) => {
    let created = false;
    try {
      const key = await uploadImageMutation.mutateAsync(data.avatar[0]);
      await createUserMutation.mutateAsync({
        ...data,
        avatarUrl: `${import.meta.env.VITE_BUCKET_URL}/${key}`,
      });
      created = true;
      await login({ username: data.username, password: data.password });
    } catch (error) {
      setAccountCreated(created);
      reportError(
        created
          ? "Your account was created, but automatic login failed."
          : "Sign up failed. Please try again.",
        error,
      );
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
        <SignUpForm onSubmit={handleSubmit} disabled={accountCreated} />
        {accountCreated && (
          <p className="mx-auto mt-4 max-w-md text-sm text-[#73746a]">
            Your account was created. <Link className="underline" to="/login">Log in</Link> to continue.
          </p>
        )}
      </section>
    </div>
  );
};

export default SignUp;