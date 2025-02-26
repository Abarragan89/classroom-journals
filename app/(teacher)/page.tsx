import { auth } from "@/auth"
import { redirect } from "next/navigation";
export default async function page() {

    const session = await auth();
    // Send to dashboard if logged in
    if (session) {
        redirect('/dashboard')
    }
    return (
        <main>
            <p>Home page</p>
        </main>
    )
}