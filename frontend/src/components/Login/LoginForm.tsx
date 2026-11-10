import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import type { LoginInfoType } from "./LoginSchema";
import loginSchema from "./LoginSchema";

interface LoginFormProps {
  onSubmit: (data: LoginInfoType) => void;
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const form = useForm<LoginInfoType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const submit = async (data: LoginInfoType) => {
    onSubmit(data);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(submit)}>
        <Field>
          <FieldLabel className="text-[#2d3a2e] font-medium">Username</FieldLabel>
          <Input
            autoComplete="username"
            placeholder="Your username."
            className="border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] placeholder-[#9ca3af] focus-visible:border-[#374333] focus-visible:ring-[#374333]/20 rounded-xl py-2.5 transition-all"
            {...form.register("username")}
          />
          <FieldDescription className="text-[#6b7280] text-xs">
            Your username.
          </FieldDescription>
          {form.formState.errors.username && (
            <FieldError className="text-red-600 text-xs mt-1">
              {form.formState.errors.username.message}
            </FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-[#2d3a2e] font-medium">Password</FieldLabel>
          <Input
            autoComplete="current-password"
            type="password"
            placeholder="Your password."
            className="border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] placeholder-[#9ca3af] focus-visible:border-[#374333] focus-visible:ring-[#374333]/20 rounded-xl py-2.5 transition-all"
            {...form.register("password")}
          />
          <FieldDescription className="text-[#6b7280] text-xs">
            Your password.
          </FieldDescription>
          {form.formState.errors.password && (
            <FieldError className="text-red-600 text-xs mt-1">
              {form.formState.errors.password.message}
            </FieldError>
          )}
        </Field>

        <Button
          type="submit"
          className="w-full mt-2 rounded-xl bg-[#374333] text-white hover:bg-[#283225] py-3 text-sm font-medium shadow-sm transition-all duration-200 active:scale-[0.99]"
        >
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;