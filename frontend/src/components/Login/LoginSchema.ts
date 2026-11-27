import z from "zod";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginInfoType = z.infer<typeof loginSchema>;

export default loginSchema;
