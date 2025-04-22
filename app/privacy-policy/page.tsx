
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { APP_NAME } from '@/lib/constants'
import ModeToggle from '@/components/shared/header/mode-toggle'

export default function PrivacyPolicy() {
    return (
        <>
            <header className='w-full border-b print:hidden'>
                <div className="py-3 px-5  flex-between">
                    <div className="flex-start">
                        <Link
                            href='/'
                            className='flex-start'>
                            <Image
                                src='/images/logo.png'
                                alt={`${APP_NAME} logo`}
                                height={50}
                                width={50}
                                priority={true}
                                className="rounded-2xl"
                            />
                        </Link>
                    </div>
                    <ModeToggle />
                </div>
            </header>
            <main className='max-w-3xl mx-auto p-6 space-y-5'>
                <Link href='/'>
                    <ArrowLeftIcon />
                </Link>
                <h1 className="text-3xl font-bold text-center">Privacy Policy for JotterBlog</h1>
                <p className="text-sm text-gray-500 mb-6 text-center">Last updated: April 22, 2025</p>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">1. Who We Are</h2>
                    <p>
                        JotterBlog is an educational web app designed to help teachers manage
                        student writing and teacher assessments. Student writings are created
                        into sharable blogs and assessments are auto graded by AI and provides
                        the teacher with assessment data. Teachers create and manage
                        student accounts.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
                    <p className="mb-2 font-medium">In order to protect student privacy, we encrypt data that may be considered Personally Identifiable Information (PII)</p>
                    <p className="mb-2 font-medium">From Teachers:</p>
                    <ul className="list-disc list-inside mb-2">
                        <li>Encrypted Name</li>
                        <li>Email address</li>
                        <li>Google account information(See section 11)</li>
                    </ul>
                    <p className="mb-2 font-medium">From Students:</p>
                    <ul className="list-disc list-inside">
                        <li>Encrypted username</li>
                        <li>Encrypted Name</li>
                        <li>Encrypted password</li>
                        <li>Blogs and responses to questions</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">3. How We Use the Information</h2>
                    <ul className="list-disc list-inside">
                        <li>Create and manage teacher and student accounts</li>
                        <li>Provide access to JotterBlog features</li>
                        <li>Securely store and manage classroom content</li>
                        <li>Automatically generate AI-assisted responses using OpenAI (see Section 6)</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">4. Children&apos;s Privacy</h2>
                    <p>
                        JotterBlog is compliant with the Children&apos;s Online Privacy Protection
                        Act (COPPA). Students under 13 use the platform under the supervision
                        of their teachers. We do not collect personal information directly from
                        students. All student accounts are created and managed by verified
                        teachers. All PII is encrypted in our databases.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">5. Data Protection and Security</h2>
                    <ul className="list-disc list-inside">
                        <li>All passwords are encrypted</li>
                        <li>Student usernames are encrypted for privacy</li>
                        <li>All data is stored securely</li>
                        <li>Access is limited to authorized personnel only</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Cookies</h2>
                    <p>
                        JotterBlog only uses essential cookies required for the website to function properly—such as session cookies that
                        keep you logged in or remember your basic preferences. We do not use tracking cookies, advertising cookies, or
                        analytics tools that collect personal data.
                    </p>
                    <p className="mt-2">
                        Because these cookies are necessary for core functionality, they cannot be disabled. By using JotterBlog, you agree
                        to the use of these essential cookies.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">6. Use of AI and External Services</h2>
                    <p>
                        When students answer questions on JotterBlog, their responses may be
                        processed by OpenAI&apos;s ChatGPT to generate scores.
                        These responses are <strong>not linked</strong> to any personal
                        identifying information. While content is shared with OpenAI for
                        processing, it is done anonymously and solely to provide educational
                        assistance within the platform.
                    </p>
                    <p className="mt-2">
                        We do not use this data for advertising or analytics, and we do not
                        allow OpenAI or any third party to access identifiable student
                        information.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">7. Data Sharing</h2>
                    <p>
                        We do <strong>not</strong> share, sell, rent, or trade any personal
                        information. The only third-party interaction involves anonymous,
                        unlinked student content sent to OpenAI for educational assistance.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">8. Data Retention and Deletion</h2>
                    <p>
                        We retain data only while an account is active. If a teacher deletes
                        their account, their account and all associated student data are
                        permanently deleted from our systems and cannot be recovered.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">9. Your Rights</h2>
                    <p>
                        Teachers may request access to their data, make corrections, or delete
                        their account and all associated student records at any time by
                        contacting us.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">10. Changes to This Policy</h2>
                    <p>
                        We may update this policy as needed. When changes are made, we will
                        notify users via email or in-app notifications. The most recent
                        version will always be available on our website.
                    </p>
                </section>
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">11. Google User Data Disclosure</h2>
                    <p>
                        JotterBlog’s use and transfer of information received from Google APIs will adhere to the{' '}
                        <a
                            href="https://developers.google.com/terms/api-services-user-data-policy"
                            className="text-blue-600 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Google API Services User Data Policy
                        </a>
                        , including the Limited Use requirements.
                    </p>
                    <p className="mt-2">
                        We request access to a teacher's basic Google profile information (Google ID, name, email address, and profile image)
                        &apos;s permission, we access their Google
                        Classrooms and classroom rosters to help populate and manage their teaching dashboard within JotterBlog.
                    </p>
                    <p className="mt-2">
                        This information is used solely to:
                    </p>
                    <ul className="list-disc list-inside mb-2">
                        <li>Verify identity and securely authenticate teacher logins</li>
                        <li>Provide personalized dashboard features</li>
                        <li>Display and manage teacher&apos;s classes and student rosters</li>
                    </ul>
                    <p>
                        We do <strong>not</strong> share Google user data with any third parties, and it is <strong>not</strong> used for advertising or analytics purposes.
                        Teachers may revoke JotterBlog&apos;s access to their Google account at any time through their Google Account settings.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">12. Contact Us</h2>
                    <p>
                        If you have any questions about this policy, please reach out to us at:
                    </p>
                    <ul className="list-none mt-2">
                        <li>Email: <a href="mailto:customer.support@jotterblog.com" className="text-blue-600 underline">customer.support@jotterblog.com</a></li>
                        <li>Website: <a href="https://jotterblog.com" className="text-blue-600 underline">https://jotterblog.com</a></li>
                    </ul>
                </section>
            </main>
        </>
    )
}
