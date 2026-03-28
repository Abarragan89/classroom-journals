'use client';
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from "../ui/button"
import { signInWithMagicLink } from "@/lib/actions/auth.action"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Mail } from 'lucide-react'
export default function MagicLink() {
    const [data, action] = useActionState(signInWithMagicLink, {
        success: false,
        message: ''
    })


    const SignInButton = () => {
        const { pending } = useFormStatus()
        return (
            <Button disabled={pending} className="w-full" variant='default' type="submit">
                {pending ? 'Sending Email' :
                    <>
                        <Mail aria-hidden="true" /> via Email
                    </>
                }
            </Button>
        )
    }

    return (
        <>
            <form
                action={action}
            >
                <input type="hidden" name="callbackUrl" />
                <div className='mb-4'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                        id='email'
                        name='email'
                        type='email'
                        placeholder='Email'
                        required
                        autoComplete='email'
                        aria-required="true"
                        aria-invalid={data && !data.success && !!data.message}
                        aria-describedby={data && !data.success && data.message ? 'magic-link-error' : undefined}
                    />
                </div>
                <SignInButton />
                {data && !data.success && (
                    <div id="magic-link-error" className="text-center text-destructive" role="alert" aria-live="assertive">
                        {data.message}
                    </div>
                )}
            </form>
        </>

    )
}