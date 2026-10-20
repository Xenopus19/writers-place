import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
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
    <div className="mx-auto max-w-md">
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(submit)}>
        <Field>
          <FieldLabel className="text-emerald-800 dark:text-emerald-200">Username</FieldLabel>
          <Input
            autoComplete="username"
            className="border-emerald-500/30 bg-white focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
            {...form.register("username")}
          />
          <FieldDescription className="text-emerald-700/80 dark:text-emerald-300/80">
            Your username.
          </FieldDescription>
          {form.formState.errors.username && (
            <FieldError>{form.formState.errors.username.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-emerald-800 dark:text-emerald-200">Password</FieldLabel>
          <Input
            autoComplete="current-password"
            type="password"
            className="border-emerald-500/30 bg-white focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
            {...form.register("password")}
          />
          <FieldDescription className="text-emerald-700/80 dark:text-emerald-300/80">
            Your password.
          </FieldDescription>
          {form.formState.errors.password && (
            <FieldError>{form.formState.errors.password.message}</FieldError>
          )}
        </Field>

        <Button
          type="submit"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;