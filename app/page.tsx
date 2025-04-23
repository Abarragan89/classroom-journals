import { auth } from "@/auth"
import { redirect } from "next/navigation";
import Header from "@/components/shared/header";
import { Session } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import TextEditorDemo from "@/components/text-editor-demo";

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
            <main className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="py-20 px-6 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        Welcome to JotterBlog
                    </h1>
                    <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-6 text-primary">
                        A modern tool for teachers to manage student writing, automatically grade assessments with AI, and create sharable student blogs — all in one place.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href="/sign-in">
                            <Button size="lg">Get Started</Button>
                        </Link>
                        <Link href="/privacy-policy">
                            <Button variant="outline" size="lg">Learn More</Button>
                        </Link>
                    </div>
                    <div className="flex flex-col items-center mt-2 text-sm rounded-lg mx-auto">
                        <p className="font-bold tracking-wide mb-2">Connects with Google Classroom!</p>
                        <Image
                            src='/images/google-classroom-logo.png'
                            width={55}
                            height={15}
                            alt='Google Classroom Logo'
                            className="rounded-lg"
                        />
                    </div>

                </section>

                {/* Features */}
                <section className="py-16 border-y border-border px-6 max-w-6xl mx-auto grid gap-12 md:grid-cols-3 text-center">
                    <div className="mx-3 md:mx-0">
                        <h3 className="text-xl font-semibold mb-2">Auto-Graded Assessments</h3>
                        <p className="text-primary mb-5">Let AI grade your assessments. No need to make it multiple-choice, just let AI handle it!</p>
                        <Image
                            src='/images/assessment-data.png'
                            width={700}
                            height={394}
                            alt="assessment data screenshot"
                            className="rounded-lg mb-4 mt-10 sm:mt-0"
                        />
                    </div>
                    <div className="mx-3 md:mx-0">
                        <Image
                            src='/images/featured-blogs.png'
                            width={700}
                            height={394}
                            alt="featured blogs screenshot"
                            className="rounded-lg mb-4 mt-10 sm:mt-0"
                        />
                        <h3 className="text-xl font-semibold mb-2">Sharable Blogs</h3>
                        <p className="text-primary">Turn student writing into blog posts for peers to comment and like. Set blogs to private to keep some assignments personal.</p>
                    </div>
                    <div className="mx-3 md:mx-0">
                        <h3 className="text-xl font-semibold mb-2">AI Anti-Cheat</h3>
                        <p className="text-primary mb-5">Custom text editor disables copy and paste, word prediction and spell check. Know exactly how well your students write.</p>
                        <Image
                            src='/images/text-editor.png'
                            width={700}
                            height={394}
                            alt="student text-editor screenshot"
                            className="rounded-lg mb-4 mt-10 sm:mt-0"
                        />
                    </div>
                </section>
                {/* Demo */}
                <section className="py-20 px-6 text-center">
                    <TextEditorDemo />
                </section>


                {/* Call to Action */}
                <section className="py-20 px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to simplify your classroom?</h2>
                    <p className="text-lg mb-6 text-primary">
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