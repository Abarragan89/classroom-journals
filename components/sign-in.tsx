'use client';
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from "./ui/button"
import { signInWithMagicLink } from "@/lib/actions/user.action"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

export function SignIn() {
    const [data, action] = useActionState(signInWithMagicLink, {
        success: false,
        message: ''
    })


    const SignInButton = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} className="w-full" variant='default'>
                {pending ? 'Signing In...' : 'Sign In'}
            </Button>
        )
    }
    return (
        <form
            action={action}
        >
            <input type="hidden" name="callbackUrl" />
            <div className="space-y-6">
                <div >
                    <Label htmlFor='email'>Email</Label>
                    <Input
                        id='email'
                        name='email'
                        type='email'
                        required
                        autoComplete='email'
                    />
                </div>
                <SignInButton />
                {data && !data.success && (
                    <div className="text-center text-destructive">
                        {data.message}
                    </div>
                )}
            </div>
        </form>
    )
}