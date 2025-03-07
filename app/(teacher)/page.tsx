import { auth } from "@/auth"
import { redirect } from "next/navigation";
import Header from "@/components/shared/header";

export default async function page() {

    const session = await auth();
    // Send to Classes if logged in
    console.log('session in classes', session)
    if (session) {
        redirect('/classes')
    }
    return (
        <>
            <Header />
            <main>
                <p>Home page</p>
            </main>
        </>
    )
}