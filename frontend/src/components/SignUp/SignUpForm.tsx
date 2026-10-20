import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import signUpSchema, { type SignUpInfoType } from "./SignUpSchema";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface SignUpFormProps {
  onSubmit: (data: SignUpInfoType) => void;
}

const SignUpForm = ({ onSubmit }: SignUpFormProps) => {
  const form = useForm<SignUpInfoType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      name: "",
      password: "",
      about: "",
    },
  });

  const submit = async (data: SignUpInfoType) => {
    onSubmit(data);
  };

  return (
    <div className="mx-auto max-w-md">
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(submit)}>
        <Field>
          <FieldLabel className="text-emerald-800 dark:text-emerald-200">Username</FieldLabel>
          <Input
            autoComplete="username"
            className="border-emerald-500/30 bg-white focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 dark:bg-emerald-950/25"
            {...form.register("username")}
          />
          <FieldDescription className="text-emerald-700/80 dark:text-emerald-300/80">
            Public username.
          </FieldDescription>
          {form.formState.errors.username && (
            <FieldError>{form.formState.errors.username.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-emerald-800 dark:text-emerald-200">Name</FieldLabel>
          <Input
            autoComplete="name"
            className="border-emerald-500/30 bg-white focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 dark:bg-emerald-950/25"
            {...form.register("name")}
          />
          <FieldDescription className="text-emerald-700/80 dark:text-emerald-300/80">
            Your display name.
          </FieldDescription>
          {form.formState.errors.name && (
            <FieldError>{form.formState.errors.name.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-emerald-800 dark:text-emerald-200">Password</FieldLabel>
          <Input
            autoComplete="new-password"
            type="password"
            className="border-emerald-500/30 bg-white focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 dark:bg-emerald-950/25"
            {...form.register("password")}
          />
          <FieldDescription className="text-emerald-700/80 dark:text-emerald-300/80">
            Your password.
          </FieldDescription>
          {form.formState.errors.password && (
            <FieldError>{form.formState.errors.password.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-emerald-800 dark:text-emerald-200">About</FieldLabel>
          <Textarea
            className="resize-none border-emerald-500/30 bg-white focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 dark:bg-emerald-950/25"
            {...form.register("about")}
          />
          <FieldDescription className="text-emerald-700/80 dark:text-emerald-300/80">
            Tell us about yourself (optional).
          </FieldDescription>
          {form.formState.errors.about && (
            <FieldError>{form.formState.errors.about.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-emerald-800 dark:text-emerald-200">Profile picture</FieldLabel>
          <Input
            type="file"
            className="border-emerald-500/30 bg-white file:text-emerald-700 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 dark:bg-emerald-950/25 dark:file:text-emerald-300"
            {...form.register("avatar")}
          />
          <FieldDescription className="text-emerald-700/80 dark:text-emerald-300/80">
            Your avatar.
          </FieldDescription>
          {form.formState.errors.avatar && (
            <FieldError>{form.formState.errors.avatar.message as string}</FieldError>
          )}
        </Field>

        <Button
          type="submit"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Sign Up
        </Button>
      </form>
    </div>
  );
};

export default SignUpForm;