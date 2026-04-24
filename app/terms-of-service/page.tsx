import NoSignInHeader from '@/components/shared/header/no-signin-header'

export default function TermsOfService() {
    return (
        <>
            <NoSignInHeader />
            <main className="max-w-3xl mx-auto p-6 space-y-6">
                <h1 className="text-3xl font-bold mb-4 text-center">Terms of Service for JotterBlog</h1>
                <p className="text-sm text-gray-500 mb-6 text-center">Last updated: March 24, 2026</p>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using JotterBlog, you agree to comply with these Terms of Service.
                        If you do not agree with any part of these terms, please do not use the website.
                        We may update these terms from time to time. Continued use after changes constitutes acceptance.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">2. Eligibility</h2>
                    <p>
                        JotterBlog is intended for use by educators and educational institutions.
                        Teachers must be at least 18 years old or authorized school personnel.
                        By creating student accounts, it is implied that the teacher or school has obtained the
                        necessary **parental or guardian consent** to use this platform with students under the age of 13,
                        in compliance with COPPA or relevant local privacy laws.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">3. Accounts and Responsibilities</h2>
                    <p>
                        Teachers are responsible for creating and managing student accounts securely.
                        Users agree not to share their login credentials and to notify us of any unauthorized access.
                        Teachers are solely responsible for the use of the platform within their classroom and must monitor student
                        use for bullying or inappropriate content. Student accounts may not be used to post content that is threatening, harassing, or inappropriate. Teachers are responsible for enforcing this within their classroom.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">4. Permitted Use</h2>
                    <p>
                        JotterBlog may be used only for lawful educational purposes. You may not:
                    </p>
                    <ul className="list-disc list-inside mt-2">
                        <li>Reverse engineer or modify the platform</li>
                        <li>Use the app for commercial or advertising purposes</li>
                        <li>Submit or generate content that is harmful, inappropriate, or illegal</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">5. Content Ownership</h2>
                    <p>
                        Teachers and students retain ownership of the content they create.
                        JotterBlog may use student writings and assessment data internally to support educational features,
                        but does not claim ownership. We do not sell or distribute user-generated content.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">6. Use of AI Services</h2>
                    <p>
                        JotterBlog uses OpenAI&apos;s ChatGPT to assist with auto-grading and writing support.
                        Student responses may be processed by OpenAI, but are not  linked to any personal identifiers.
                        AI-generated responses are for educational purposes only and may not be 100% accurate. AI-generated grades and feedback are provided as a tool to assist teachers and should not be used as the sole basis for academic evaluation.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">7. Privacy and Data</h2>
                    <p>
                        Please refer to our <a href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</a> for information
                        about how we collect, store, and use data. We do not share, sell, or use data for advertising purposes.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">8. Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate any account that violates these terms.
                        Teachers may request to delete their account and associated data at any time.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">9. Disclaimer of Warranty</h2>
                    <p>
                        JotterBlog is provided &apos;as is&apos; without any warranties, express or implied.
                        We do not guarantee that the app will always be error-free, available, or secure.
                    </p>
                </section>
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">10. Indemnification Clause</h2>
                    <p>
                        You agree to indemnify and hold harmless JotterBlog and Anthony Barragan from any claims, damages, or expenses arising from your use of the platform or violation of these terms.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">11. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, JotterBlog shall not be held liable for any indirect, incidental,
                        or consequential damages resulting from the use or inability to use the platform.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">12. Governing Law</h2>
                    <p>
                        These Terms are governed by the laws of the State of California, without regard to its conflict of law principles.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">13. Contact</h2>
                    <p>
                        For questions or concerns regarding these terms, please contact us:
                    </p>
                    <ul className="list-none mt-2">
                        <li>Email: <a href="mailto:support@jotterblog.com" className="text-blue-600 underline">support@jotterblog.com</a></li>
                        <li>Website: <a href="https://jotterblog.com" className="text-blue-600 underline">https://jotterblog.com</a></li>
                    </ul>
                </section>
            </main>
        </>
    )
}
