'use client'
import { APP_NAME } from "@/lib/constants"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Image
                src='/images/logo.png'
                height={100}
                width={100}
                alt={`${APP_NAME} logo`}
                priority={true}
                className="rounded-3xl"
            />
            <div className="p-6 w-[80%] max-w-lg border border-border bg-card rounded-lg shadow-md text-center mt-10">
                <h1 className="text-3xl font-bold mb-4">Not Found</h1>
                <p className="text-destructive">Cound not find requested page</p>
                <Button variant='outline' className="mt-4 ml-2" onClick={() => (window.location.href = '/')}>
                    Back To Home
                </Button>
            </div>
        </div>
    )
}
