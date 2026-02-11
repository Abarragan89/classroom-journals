'use client'
import { signInWithGoogle } from "@/lib/actions/auth.action"
import { useActionState } from "react"
import { Button } from "../ui/button"
import { useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"
import { FaGoogle } from "react-icons/fa";

export default function GoogleButton() {
    // Error message does not render because of the redirect.
    const [_errorMsg, dispatchGoogle] = useActionState(signInWithGoogle, {
        success: true,
        message: ''
    })

    const { pending } = useFormStatus()
    const searchParams = useSearchParams();

    // This error will appear if email is already registered with magic link
    const error = searchParams.get('error')

    return (
        <form action={dispatchGoogle} className="mt-1">
            <Button className="w-full flex items-center justify-center" variant='default' disabled={pending}>
                <FaGoogle size={20} />
                <p>Google<span className="text-xs ml-2">(recommended)</span></p>
            </Button>
            <p className="text-xs font-bold text-center mt-1">Connects with Google Classroom</p>
            {error === 'OAuthAccountNotLinked' && (
                <>
                    <p className="text-center text-destructive my-5 text-sm">Another account already exists with the same e-mail.</p>
                    <p className="text-center text-destructive  text-sm">Try logging in with Magic Link</p>
                </>
            )}
        </form>
    )
}
