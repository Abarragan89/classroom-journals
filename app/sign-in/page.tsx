import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
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
                                src='/images/logo.svg'
                                alt={`${APP_NAME}`}
                                width={100}
                                height={100}
                                priority={true}
                            />
                        </Link>
                        <CardTitle className="text-center">Sign In</CardTitle>
                        <CardDescription className="text-center">
                            Sign in to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>

                        {/* Magic Link Login*/}
                        <MagicLink />

                        <p className="my-4 text-center relative">
                            <span className="relative z-10 bg-card px-3">or</span>
                            <span className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 border-t border-gray-500"></span>
                        </p>


                        {/*  Google Login */}
                        <GoogleButton />

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
