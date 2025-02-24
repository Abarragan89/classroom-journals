import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { APP_NAME } from "@/lib/constants"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { SignIn as SignInForm } from "@/components/sign-in"
import { auth } from "@/auth";
import { redirect } from "next/navigation"


export const metadata: Metadata = {
    title: 'Sign In'
}

export default async function SignIn() {

    const session = await auth()

    if (session) {
        return redirect('/')
    }
    return (
        <div className="w-full max-w-md mx-auto">
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
                <CardContent className="space-y-4">
                    <SignInForm />
                </CardContent>
            </Card>
        </div>
    )
}
