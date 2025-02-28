import { auth } from "@/auth"
import { redirect } from "next/navigation";
import Header from "@/components/shared/header";
export default async function page() {

    const session = await auth();
    // Send to dashboard if logged in
    if (session) {
        redirect('/dashboard')
    }
    return (
        <main>
            <Header />
            <p>Home page</p>
        </main>
    )
}