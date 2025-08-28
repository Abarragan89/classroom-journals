'use server';
import { signInFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

// Sign in user with email magic link
export async function signInWithMagicLink(prevState: unknown, formData: FormData) {
    try {
        signInFormSchema.parse({
            email: formData.get('email')
        })
        await signIn("resend", formData)
        return { success: true, message: 'Signed in successfully' }
    } catch (error) {
        // redirect is part of the normal flow and this lets Auth handle the redirect without crashing
        if (isRedirectError(error)) {
            throw error
        }
        return { success: false, message: 'Invalid email or password' }
    }
}

// Sign in with google 
export async function signInWithGoogle() {
    try {
        await signIn("google", { redirectTo: '/classes' })
        return { success: true, message: 'Signed in successfully' }
    } catch (error) {
        // redirect is part of the normal flow and this lets Auth handle the redirect without crashing
        if (isRedirectError(error)) {
            throw error
        }
        return { success: false, message: 'Email may be associated with an existing accout. Try signing in with Magic Link' }
    }
}

// Sign user out
export async function signOutUser() {
    await signOut({ redirect: false });  // prevent auto redirect
    revalidatePath('/');
    redirect('/');

}