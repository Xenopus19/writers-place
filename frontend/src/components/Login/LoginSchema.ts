import type z from "zod";
import signUpSchema from "../SignUp/SignUpSchema";

const loginSchema = signUpSchema.pick({username: true, password: true})

export type LoginInfoType = z.infer<typeof loginSchema>;

export default loginSchema