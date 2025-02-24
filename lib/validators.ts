import { z } from "zod";

//  Schema for signing users in
export const signInFormSchema = z.object({
    email: z.string().email('Invalid email address')
})