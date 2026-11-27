import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import type { LoginInfoType } from "./LoginSchema";
import loginSchema from "./LoginSchema";

interface LoginFormProps {
  onSubmit: (data: LoginInfoType) => Promise<void>;
}

const describedBy = (id: string, hasError: boolean) =>
  hasError ? `${id}-description ${id}-error` : `${id}-description`;

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const form = useForm<LoginInfoType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const { errors } = form.formState;

  const submit = async (data: LoginInfoType) => {
    await onSubmit(data);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <form className="flex flex-col gap-5" noValidate onSubmit={form.handleSubmit(submit)}>
        <Field>
          <FieldLabel htmlFor="login-username" className="text-[#2d3a2e] font-medium">Username</FieldLabel>
          <Input
            id="login-username"
            autoComplete="username"
            placeholder="Your username."
            aria-invalid={!!errors.username}
            aria-describedby={describedBy("login-username", !!errors.username)}
            className="border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] placeholder-[#6b7280] focus-visible:border-[#374333] focus-visible:ring-[#374333]/60 rounded-xl py-2.5 transition-all"
            {...form.register("username")}
          />
          <FieldDescription id="login-username-description" className="text-[#6b7280] text-xs">
            Your username.
          </FieldDescription>
          {errors.username && (
            <FieldError id="login-username-error" className="text-red-700 text-xs mt-1">
              {errors.username.message}
            </FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="login-password" className="text-[#2d3a2e] font-medium">Password</FieldLabel>
          <Input
            id="login-password"
            autoComplete="current-password"
            type="password"
            placeholder="Your password."
            aria-invalid={!!errors.password}
            aria-describedby={describedBy("login-password", !!errors.password)}
            className="border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] placeholder-[#6b7280] focus-visible:border-[#374333] focus-visible:ring-[#374333]/60 rounded-xl py-2.5 transition-all"
            {...form.register("password")}
          />
          <FieldDescription id="login-password-description" className="text-[#6b7280] text-xs">
            Your password.
          </FieldDescription>
          {errors.password && (
            <FieldError id="login-password-error" className="text-red-700 text-xs mt-1">
              {errors.password.message}
            </FieldError>
          )}
        </Field>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full mt-2 rounded-xl bg-[#374333] text-white hover:bg-[#283225] py-3 text-sm font-medium shadow-sm transition-all duration-200 active:scale-[0.99]"
        >
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
