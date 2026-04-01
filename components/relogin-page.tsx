"use client"
import { signOutUser } from "@/lib/actions/auth.action"
import { Button } from "./ui/button"
import { redirect } from "next/navigation"

export default function ReloginPage() {

    async function handleSignOut() {
        await signOutUser()
        redirect('/sign-in')
    }


    return (
        <main id="main-content" className="flex flex-col items-center justify-center mt-36">
            <div className="p-6 w-[80%] max-w-lg border border-border bg-card rounded-lg shadow-md text-center mt-10">
                <h1 className="text-3xl font-bold mb-4">You Need to Sign In Again</h1>
                <div className="mt-4 flex justify-center gap-2">
                    <form action={handleSignOut}>
                        <Button variant='outline' type="submit" onClick={handleSignOut}>
                            Sign Out
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    )
}
