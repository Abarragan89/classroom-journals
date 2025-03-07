import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { APP_NAME } from "@/lib/constants"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import MagicLink from "@/components/auth/magic-link"
import { auth } from "@/auth";
import { redirect } from "next/navigation"
import GoogleButton from "@/components/auth/google-button"

export const metadata: Metadata = {
    title: 'Sign In'
}

export default async function SignIn() {

    const session = await auth()

    if (session) {
        return redirect('/')
    }
    return (
        <div className="flex-center min-h-screen w-full">
            <div className="w-full px-5 max-w-md mx-auto">
                <Card>
                    <CardHeader className="space-y-4">
                        <Link href='/' className="flex-center">
                            <Image
                                className="rounded-3xl"
                                src='/images/logo.png'
                                alt={`${APP_NAME}`}
                                width={100}
                                height={100}
                                priority={true}
                            />
                        </Link>
                        <CardTitle className="text-center">JotterBlog Login</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-5">
                        {/*  Google Login */}
                        <GoogleButton />
                        <p className="my-5 text-center relative">
                            <span className="relative z-10 bg-card px-3">or</span>
                            <span className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 border-t border-gray-500"></span>
                        </p>
                        {/* Magic Link Login*/}
                        <MagicLink />

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
