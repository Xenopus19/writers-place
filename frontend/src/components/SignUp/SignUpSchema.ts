import z from "zod";

import { baseSignUpSchema } from "@writers-place/shared";

const signUpSchema = baseSignUpSchema.extend({
  avatar: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Choose a profile picture.")
    .refine(
      (files) => files?.[0]?.type.startsWith("image/"),
      "The profile picture must be an image file.",
    )
    .refine(
      (files) => files?.[0]?.size <= 5 * 1024 * 1024,
      "The profile picture must be 5 MB or smaller.",
    ),
});

export const aboutChangeSchema = signUpSchema.pick({ about: true });
export type SignUpInfoType = z.infer<typeof signUpSchema>;
export type SignUpRequestType = Omit<SignUpInfoType, "avatar"> & { avatarUrl: string };

export default signUpSchema;