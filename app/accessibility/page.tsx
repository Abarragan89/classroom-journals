import Header from "@/components/shared/header"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function page() {
    return (
        <>
            <Header />
            <main className='wrapper'>
                <Link href='/' aria-label="Go back to home">
                    <ArrowLeftIcon aria-hidden="true" />
                </Link>

                <h1 className='h1-bold text-center mb-10'>Accessibility Statement</h1>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">Our Commitment</h2>
                    <p>JotterBlog is committed to ensuring digital accessibility for all users. We are actively working to improve the accessibility of our website and application in accordance with WCAG 2.1 Level AA guidelines. We believe that all users, regardless of ability, should have equal access to our platform.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">Measures We Have Taken</h2>
                    <p className="mb-3">We have taken the following steps to ensure accessibility across JotterBlog:</p>
                    <ul className="list-disc list-outside ml-8 space-y-2">
                        <li className="pl-2">Semantic HTML throughout the application to support screen readers</li>
                        <li className="pl-2">Keyboard navigation support on all interactive elements</li>
                        <li className="pl-2">Screen reader compatibility tested with VoiceOver on Mac</li>
                        <li className="pl-2">Sufficient color contrast on all text elements</li>
                        <li className="pl-2">Descriptive alt text on all meaningful images</li>
                        <li className="pl-2">ARIA labels on all interactive components that require additional context</li>
                        <li className="pl-2">Visible focus indicators on all focusable elements</li>
                        <li className="pl-2">Logical tab order that matches the visual layout of each page</li>
                        <li className="pl-2">Skip navigation link to allow keyboard users to bypass repeated content</li>
                        <li className="pl-2">Unique and descriptive page titles on every page</li>
                        <li className="pl-2">Form inputs with associated labels and descriptive error messages</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">Known Limitations</h2>
                    <p>While we strive for full WCAG 2.1 Level AA compliance, some areas of the platform may still be in the process of being improved. We are actively identifying and resolving any remaining accessibility barriers. If you encounter something that is not working as expected, please let us know.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">Third Party Content</h2>
                    <p>JotterBlog integrates with Google Classroom and uses OpenAI for AI-assisted grading. While we work to ensure our own platform is accessible, some third party components may have their own accessibility limitations that are outside of our direct control. We are committed to selecting and working with third party providers that share our commitment to accessibility.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">Feedback and Contact</h2>
                    <p className="mb-3">We welcome feedback on the accessibility of JotterBlog. If you experience any accessibility barriers or have suggestions for improvement, please reach out to us.</p>
                    <ul className="list-disc list-outside ml-8 space-y-2">
                        <li className="pl-2">Email: <a href="mailto:support@jotterblog.com" className="underline">support@jotterblog.com</a></li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">Last Updated</h2>
                    <p>This accessibility statement was last updated on March 29, 2026.</p>
                </section>

            </main>
        </>
    )
}