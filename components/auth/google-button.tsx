'use client'
import { signInWithGoogle } from "@/lib/actions/auth.action"
import { useActionState } from "react"
import { Button } from "../ui/button"
import { useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"

export default function GoogleButton() {
    // Error message does not render because of the redirect.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            <Button className="w-full flex flex-col" variant='default' disabled={pending}>
                <p>Google Sign In <span className="text-sm">(recommended)</span></p>
            </Button>
            <p className="text-center mt-1">Connects with Google Classroom</p>
            {error === 'OAuthAccountNotLinked' && (
                <>
                    <p className="text-center text-destructive my-5 text-sm">Another account already exists with the same e-mail.</p>
                    <p className="text-center text-destructive  text-sm">Try logging in with Magic Link</p>
                </>
            )}
        </form>
    )
}
