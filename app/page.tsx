import { auth } from "@/auth"
import { redirect } from "next/navigation";
import Header from "@/components/shared/header";
import Footer from "@/components/footer";
import { Session } from "@/types";

export default async function page() {

    const session = await auth() as Session;

    if (session) {
        if (session?.user?.role === 'teacher') {
            redirect(`/classes`)
        } else if (session?.user?.role === 'student') {
            redirect('/student-dashboard')
        }
    }

    return (
        <>
            <Header />
            <main>
                <p>Home page</p>
            </main>
            <Footer />
        </>
    )
}