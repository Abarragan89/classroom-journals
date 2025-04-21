'use client'
import { Button } from '@/components/ui/button'
import { signOutUser } from '@/lib/actions/auth.action'
import Link from 'next/link'

export default function Error() {
    return (
        <main className='wrapper'>
        <section className='w-fit mx-auto mt-24 border border-border p-10 px-16 rounded-lg flex flex-col justify-between items-center'>
            <p className='text-center text-destructive mb-5'>Whoops... something happened.</p>
            <div className="flex-around space-x-5">
            <Button asChild>
                <Link href='/'>
                    Go Home
                </Link>
            </Button>
            <Button
                onClick={signOutUser}
            >
                Sign out
            </Button>
            </div>
        </section>
        </main>
    )
}
