import z from "zod";

import { baseSignUpSchema } from "@writers-place/shared";

const signUpSchema = baseSignUpSchema.extend({
  avatar: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Need one file")
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, "Max size 5MB"),
});

export const aboutChangeSchema = signUpSchema.pick({ about: true });
export type SignUpInfoType = z.infer<typeof signUpSchema>;
export type SignUpRequestType = Omit<SignUpInfoType, "avatar"> & { avatarUrl: string };

export default signUpSchema;