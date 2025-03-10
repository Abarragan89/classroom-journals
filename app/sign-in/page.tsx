import { Metadata } from "next"
import { auth } from "@/auth";
import { redirect } from "next/navigation"
import SignInMainForm from "./sign-in-main-form";
import Header from "@/components/shared/header"


export const metadata: Metadata = {
    title: 'Sign In'
}

export default async function SignIn() {

    const session = await auth()

    if (session) {
        return redirect('/')
    }
    return (
        <main>
            <Header />
            <h1 className="text-center h1-bold mt-[110px] mb-2">Welcome</h1>
            <div className="flex-center w-full">
                <div className="w-full px-5 max-w-md mx-auto">
                    <SignInMainForm />
                </div>
            </div>
        </main>
    )
}
