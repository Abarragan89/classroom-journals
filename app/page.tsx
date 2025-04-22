import { auth } from "@/auth"
import { redirect } from "next/navigation";
import Header from "@/components/shared/header";
import { Session } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
            <main className="min-h-screen bg-background text-primary">
                {/* Hero Section */}
                <section className="py-20 px-6 text-center bg-gradient-to-br from-blue-50 to-white">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        Welcome to JotterBlog
                    </h1>
                    <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-6 text-muted-foreground">
                        A modern tool for teachers to manage student writing, get AI-generated feedback, and create sharable student blogs — all in one place.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href="/sign-in">
                            <Button size="lg">Get Started</Button>
                        </Link>
                        <Link href="/privacy-policy">
                            <Button variant="outline" size="lg">Learn More</Button>
                        </Link>
                    </div>
                </section>

                {/* Features */}
                <section className="py-16 px-6 max-w-6xl mx-auto grid gap-12 md:grid-cols-3 text-center">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Auto-Graded Assessments</h3>
                        <p className="text-muted-foreground">Let AI assist with evaluating student work so you can focus on meaningful feedback.</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Sharable Blogs</h3>
                        <p className="text-muted-foreground">Turn student writing into simple, safe, and shareable blog posts.</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Privacy-First</h3>
                        <p className="text-muted-foreground">All student data is encrypted. No ads. No tracking. Fully COPPA-compliant.</p>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-20 px-6 bg-blue-100 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to simplify your classroom?</h2>
                    <p className="text-lg mb-6 text-muted-foreground">
                        Sign up today and let JotterBlog help you manage student writing with ease.
                    </p>
                    <Link href="sign-in">
                        <Button size="lg">Join Now</Button>
                    </Link>
                </section>
            </main>
        </>
    )
}