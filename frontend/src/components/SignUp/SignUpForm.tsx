import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import signUpSchema, { type SignUpInfoType } from "./SignUpSchema";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Spinner } from "../ui/spinner";

interface SignUpFormProps {
  onSubmit: (data: SignUpInfoType) => Promise<void>;
  disabled?: boolean;
}

const SignUpForm = ({ onSubmit, disabled = false }: SignUpFormProps) => {
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
    await onSubmit(data);
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
            Public username.
          </FieldDescription>
          {form.formState.errors.username && (
            <FieldError className="text-red-600 text-xs mt-1">
              {form.formState.errors.username.message}
            </FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-[#2d3a2e] font-medium">Name</FieldLabel>
          <Input
            autoComplete="name"
            placeholder="Your display name."
            className="border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] placeholder-[#9ca3af] focus-visible:border-[#374333] focus-visible:ring-[#374333]/20 rounded-xl py-2.5 transition-all"
            {...form.register("name")}
          />
          <FieldDescription className="text-[#6b7280] text-xs">
            Your display name.
          </FieldDescription>
          {form.formState.errors.name && (
            <FieldError className="text-red-600 text-xs mt-1">
              {form.formState.errors.name.message}
            </FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-[#2d3a2e] font-medium">Password</FieldLabel>
          <Input
            autoComplete="new-password"
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

        <Field>
          <FieldLabel className="text-[#2d3a2e] font-medium">About</FieldLabel>
          <Textarea
            placeholder="Tell us about yourself."
            className="resize-none border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] placeholder-[#9ca3af] focus-visible:border-[#374333] focus-visible:ring-[#374333]/20 rounded-xl py-2.5 transition-all"
            {...form.register("about")}
          />
          <FieldDescription className="text-[#6b7280] text-xs">
            Tell us about yourself (optional).
          </FieldDescription>
          {form.formState.errors.about && (
            <FieldError className="text-red-600 text-xs mt-1">
              {form.formState.errors.about.message}
            </FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-[#2d3a2e] font-medium">Profile picture</FieldLabel>
          <Input
            type="file"
            className="border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] file:text-[#2d3a2e] focus-visible:border-[#374333] focus-visible:ring-[#374333]/20 rounded-xl py-2.5 transition-all"
            {...form.register("avatar")}
          />
          <FieldDescription className="text-[#6b7280] text-xs">
            Your avatar.
          </FieldDescription>
          {form.formState.errors.avatar && (
            <FieldError className="text-red-600 text-xs mt-1">
              {form.formState.errors.avatar.message as string}
            </FieldError>
          )}
        </Field>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting || disabled}
          className="w-full mt-2 rounded-xl bg-[#374333] text-white hover:bg-[#283225] py-3 text-sm font-medium shadow-sm transition-all duration-200 active:scale-[0.99]"
        >
          {form.formState.isSubmitting ? (
            <span role="status" className="flex items-center gap-2">
              <Spinner aria-hidden="true" className="motion-reduce:animate-none" />
              Signing up...
            </span>
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>
    </div>
  );
};

export default SignUpForm;