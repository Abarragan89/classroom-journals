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
        <form action={dispatchGoogle} className="mt-3">
            {/* <p className="text-sm">Sign with Google to connect with Google Classroom!</p> */}
            <Button className="w-full flex flex-col" variant='default' disabled={pending}>
                <p>Google Sign In (recommended)</p>
            </Button>
            <p className="mt-1 text-center text-sm font-bold">Connects with Google Classroom!</p>
            {error === 'OAuthAccountNotLinked' && (
                <>
                    <p className="text-center text-destructive mt-5 text-sm">Another account already exists with the same e-mail.</p>
                    <p className="text-center text-destructive  text-sm">Try logging in with Magic Link</p>
                </>
            )}
        </form>
    )
}
