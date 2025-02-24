'use server';
import { signInFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// Sign in user with email magic link
export async function signInWithMagicLink(prevState: unknown, formData: FormData) {
    try {
        signInFormSchema.parse({
            email: formData.get('email')
        })
        await signIn("sendgrid", formData)
        return { success: true, message: 'Signed in successfully' }
    } catch (error) {
        if (isRedirectError(error)) {
            throw error
        }
        return { success: false, message: 'Invalid email or password' }
    }
}

// Sign user out
export async function signOutUser() {
    await signOut();
}