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

const describedBy = (id: string, hasError: boolean) =>
  hasError ? `${id}-description ${id}-error` : `${id}-description`;

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
  const { errors } = form.formState;

  const submit = async (data: SignUpInfoType) => {
    await onSubmit(data);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <form className="flex flex-col gap-5" noValidate onSubmit={form.handleSubmit(submit)}>
        <Field>
          <FieldLabel htmlFor="signup-username" className="text-[#2d3a2e] font-medium">Username</FieldLabel>
          <Input
            id="signup-username"
            autoComplete="username"
            placeholder="Your username."
            aria-invalid={!!errors.username}
            aria-describedby={describedBy("signup-username", !!errors.username)}
            className="border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] placeholder-[#6b7280] focus-visible:border-[#374333] focus-visible:ring-[#374333]/60 rounded-xl py-2.5 transition-all"
            {...form.register("username")}
          />
          <FieldDescription id="signup-username-description" className="text-[#6b7280] text-xs">
            Public username, 3 to 32 characters.
          </FieldDescription>
          {errors.username && (
            <FieldError id="signup-username-error" className="text-red-700 text-xs mt-1">
              {errors.username.message}
            </FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="signup-name" className="text-[#2d3a2e] font-medium">Name</FieldLabel>
          <Input
            id="signup-name"
            autoComplete="name"
            placeholder="Your display name."
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("signup-name", !!errors.name)}
            className="border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] placeholder-[#6b7280] focus-visible:border-[#374333] focus-visible:ring-[#374333]/60 rounded-xl py-2.5 transition-all"
            {...form.register("name")}
          />
          <FieldDescription id="signup-name-description" className="text-[#6b7280] text-xs">
            Your display name.
          </FieldDescription>
          {errors.name && (
            <FieldError id="signup-name-error" className="text-red-700 text-xs mt-1">
              {errors.name.message}
            </FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="signup-password" className="text-[#2d3a2e] font-medium">Password</FieldLabel>
          <Input
            id="signup-password"
            autoComplete="new-password"
            type="password"
            placeholder="Your password."
            aria-invalid={!!errors.password}
            aria-describedby={describedBy("signup-password", !!errors.password)}
            className="border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] placeholder-[#6b7280] focus-visible:border-[#374333] focus-visible:ring-[#374333]/60 rounded-xl py-2.5 transition-all"
            {...form.register("password")}
          />
          <FieldDescription id="signup-password-description" className="text-[#6b7280] text-xs">
            At least 5 characters.
          </FieldDescription>
          {errors.password && (
            <FieldError id="signup-password-error" className="text-red-700 text-xs mt-1">
              {errors.password.message}
            </FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="signup-about" className="text-[#2d3a2e] font-medium">About</FieldLabel>
          <Textarea
            id="signup-about"
            placeholder="Tell us about yourself."
            aria-invalid={!!errors.about}
            aria-describedby={describedBy("signup-about", !!errors.about)}
            className="resize-none border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] placeholder-[#6b7280] focus-visible:border-[#374333] focus-visible:ring-[#374333]/60 rounded-xl py-2.5 transition-all"
            {...form.register("about")}
          />
          <FieldDescription id="signup-about-description" className="text-[#6b7280] text-xs">
            Tell us about yourself (optional).
          </FieldDescription>
          {errors.about && (
            <FieldError id="signup-about-error" className="text-red-700 text-xs mt-1">
              {errors.about.message}
            </FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="signup-avatar" className="text-[#2d3a2e] font-medium">Profile picture</FieldLabel>
          <Input
            id="signup-avatar"
            type="file"
            accept="image/*"
            aria-invalid={!!errors.avatar}
            aria-describedby={describedBy("signup-avatar", !!errors.avatar)}
            className="border-[#e2dfd7] bg-[#fcfbf9] text-[#2d3a2e] file:text-[#2d3a2e] focus-visible:border-[#374333] focus-visible:ring-[#374333]/60 rounded-xl py-2.5 transition-all"
            {...form.register("avatar")}
          />
          <FieldDescription id="signup-avatar-description" className="text-[#6b7280] text-xs">
            An image file up to 5 MB.
          </FieldDescription>
          {errors.avatar && (
            <FieldError id="signup-avatar-error" className="text-red-700 text-xs mt-1">
              {errors.avatar.message as string}
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
