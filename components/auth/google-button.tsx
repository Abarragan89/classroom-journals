'use client'
import { signInWithGoogle } from "@/lib/actions/user.action"
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

    const error = searchParams.get('error')

    console.log('erro ', error)


    return (
        <form action={dispatchGoogle}>
            <Button className="w-full" variant='default' disabled={pending}>
                Google Sign In
            </Button>
            {error === 'OAuthAccountNotLinked' && (
                <>
                    <p className="text-center text-destructive mt-5 text-sm">Another account already exists with the same e-mail.</p>
                    <p className="text-center text-destructive  text-sm">Try logging in with Magic Link</p>
                </>
            )}
        </form>
    )
}
