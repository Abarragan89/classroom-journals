'use client'
import { APP_NAME } from "@/lib/constants"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { signOutUser } from "@/lib/actions/auth.action"

export default function NotFoundPage() {
    return (
        <main id="main-content" className="flex flex-col items-center justify-center min-h-screen">
            <Image
                src='/images/logo-v3.png'
                height={100}
                width={100}
                alt={`${APP_NAME} logo`}
                priority={true}
            />
            <div className="p-6 w-[80%] max-w-lg border border-border bg-card rounded-lg shadow-md text-center mt-10">
                <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
                <p className="text-destructive">Could not find requested page.</p>
                <div className="mt-4 flex justify-center gap-2">
                    <Button variant='outline' asChild>
                        <a href='/'>
                            Back To Home
                        </a>
                    </Button>
                    <Button variant='outline' onClick={signOutUser}>
                        Sign Out
                    </Button>
                </div>
            </div>
        </main>
    )
}
