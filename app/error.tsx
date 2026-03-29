'use client'
import { Button } from '@/components/ui/button'
import { signOutUser } from '@/lib/actions/auth.action'
import Link from 'next/link'

export default function Error() {
    return (
        <main id="main-content" className='wrapper'>
            <section className='w-fit mx-auto mt-24 border border-border p-10 px-16 rounded-lg flex flex-col justify-between items-center'>
                <h1 className='sr-only'>Error</h1>
                <p className='text-center text-destructive mb-5' role="alert">Whoops... something happened.</p>
                <div className="flex-around space-x-5">
                    <Button asChild>
                        <Link href='/'>
                            Go Home
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        onClick={signOutUser}
                    >
                        Sign out
                    </Button>
                </div>
            </section>
        </main>
    )
}
