import { auth } from "@/auth"
import { redirect } from "next/navigation";
import Header from "@/components/shared/header";
import { Response, Session } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import TextEditorDemo from "@/components/text-editor-demo";
import BlogMetaDetails from "@/components/blog-meta-details";
import { Separator } from "@/components/ui/separator";
import CommentSection from "@/components/shared/comment-section";
import { CornerRightUp } from "lucide-react";

export default async function page() {

    const session = await auth() as Session;

    if (session) {
        if (session?.user?.role === 'TEACHER') {
            redirect(`/classes`)
        } else if (session?.user?.role === 'STUDENT') {
            redirect('/student-dashboard')
        }
    }

    const response: Response = {

        id: '8097935b-c272-48f4-8c6d-289891cba124',
        likes: [],
        likeCount: 0,
        submittedAt: new Date('2025-04-24T01:18:11.967Z'),
        response: [
            {
                answer: 'Test',
                question: 'How was your Spring Break? What  did you do? How do you feel knowing there are only 8 weeks left in school!'
            },
            { answer: 'Rethinking Romeo and Juliet: A Study of Youth and Rebellion', question: 'Add a Blog Title' },
            {
                answer: 'https://unfinished-pages.s3.us-east-2.amazonaws.com/17.png-1735541082906',
                question: 'Add a Cover Photo'
            }
        ],
        _count: { comments: 0 },
        comments: [],
        // @ts-expect-error: using Dummy Data
        student: {
            id: '94de9ffa-4753-4656-adad-32c03c5f6001',
            name: 'Flor Liera',
            username: 'Flor'
        },
        // @ts-expect-error: using Dummy Data
        promptSession: { status: 'OPEN', promptType: 'BLOG' }
    }

    const dummyBlogText = `Shakespeare's Romeo and Juliet is often dismissed as a simple love story, but beneath the romantic tragedy lies a powerful exploration of youth rebellion against societal constraints. The young lovers don't just defy their feuding families—they challenge an entire social system that prioritizes family honor over individual happiness. Their secret marriage, clandestine meetings, and ultimate sacrifice represent a direct rebellion against the adult world's expectations and the rigid social structures of Verona. In this light, Romeo and Juliet becomes less about star-crossed romance and more about the eternal conflict between youthful idealism and established authority.

        The play's portrayal of adults reveals Shakespeare's critique of generational power dynamics. The Capulets and Montagues are trapped in a cycle of inherited hatred they can no longer even explain, while figures like Friar Lawrence and the Nurse, despite their good intentions, ultimately fail the young protagonists. The adults in Romeo and Juliet are either actively harmful or ineffectively helpful, creating a world where youth must forge their own path. This pattern reflects the universal experience of young people who feel misunderstood by the older generation and must choose between conformity and authentic self-expression.`


    return (
        <>
            <Header />
            <main className="min-h-screen relative">
                {/* Hero Section - Above the Fold */}
                <section className="relative max-w-7xl mx-auto">
                    <div className="p-10 lg:py-14">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Column - Value Proposition */}
                            <div className="text-center lg:text-left space-y-6">
                                {/* Social Proof Badge */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-primary border-2 border-background" />
                                        <div className="w-6 h-6 rounded-full bg-accent border-2 border-background" />
                                        <div className="w-6 h-6 rounded-full bg-secondary border-2 border-background" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">Trusted by educators nationwide</span>
                                </div>

                                {/* Main Headline */}
                                <div>
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                                        Stop Grading.
                                        <br />
                                        <span className="text-muted-foreground">Start Teaching.</span>
                                    </h1>
                                    <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                                        Reclaim 10+ hours per week with AI-powered grading that uses <span className="font-semibold text-foreground">your custom rubrics</span>. Your students write, AI grades, you focus on what matters.
                                    </p>
                                </div>

                                {/* Google Classroom Integration Highlight */}
                                <div className="flex items-center justify-center lg:justify-start gap-3 p-4 bg-card rounded-lg border border-border max-w-md mx-auto lg:mx-0">
                                    <Image
                                        src='/images/google-classroom-logo.png'
                                        width={40}
                                        height={40}
                                        alt='Google Classroom Logo'
                                        className="rounded"
                                    />
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">Seamless Google Classroom Sync</p>
                                        <p className="text-xs text-muted-foreground">Import rosters in seconds</p>
                                    </div>
                                </div>

                                {/* Primary CTA */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link href="/sign-in">
                                        <Button size="lg" className="text-base px-8 py-6 w-full sm:w-auto">
                                            Get Started
                                            <span className="ml-2">→</span>
                                        </Button>
                                    </Link>
                                    <Link href="#app-demo-section">
                                        <Button variant="outline" size="lg" className="text-base px-8 py-6 w-full sm:w-auto">
                                            See Demo
                                        </Button>
                                    </Link>
                                </div>

                                {/* Trust Indicators */}
                                <p className="text-sm text-muted-foreground">
                                    ✓ No credit card required  •  ✓ AI graded Essays and Assessments
                                </p>
                            </div>

                            {/* Right Column - Hero Image */}
                            <div className="relative">
                                {/* Hero Image */}
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative shadow-2xl">
                                    <Image
                                        src="/images/hero-photo.png"
                                        alt="Students engaged in writing assignments on JotterBlog platform"
                                        width={1200}
                                        height={900}
                                        priority
                                        className="object-cover w-full h-full"
                                    />
                                </div>

                                {/* Floating stats cards */}
                                <div className="hidden lg:block absolute -left-4 top-1/4 bg-card border border-border rounded-lg p-4 shadow-lg max-w-[180px]">
                                    <p className="text-xl font-bold text-primary">Essays</p>
                                    <p className="text-xs text-muted-foreground">Graded with your custom rubrics</p>
                                </div>
                                <div className="hidden lg:block absolute -right-4 top-1/2 bg-card border border-border rounded-lg p-4 shadow-lg max-w-[180px]">
                                    <p className="text-xl font-bold text-primary">Exit Tickets</p>
                                    <p className="text-xs text-muted-foreground">Just post your questions. AI grades them instantly</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='hidden sm:flex items-baseline text-sm absolute -top-7 right-36 text-muted-foreground italic font-medium opacity-0 animate-bounce-down gap-2'>
                        Try our themes!
                        <CornerRightUp className="w-4 h-4" />
                    </div>
                    {/* Theme switcher hint - repositioned */}

                </section>

                <Separator />
                {/* Features - Redesigned with better hierarchy */}
                <section className="py-12 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need in One Platform</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Powerful tools designed by teachers, for teachers. No learning curve, just results.
                        </p>
                    </div>

                    {/* Feature 1 - AI Rubric Grading (Hero Feature) */}
                    <div className="mb-16 bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-8 lg:p-12 border border-border">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <div className="inline-block px-4 py-1 bg-accent/10 rounded-full border border-accent/20">
                                    <span className="text-sm font-semibold">⭐ Most Popular</span>
                                </div>
                                <h3 className="text-3xl font-bold">AI Grading with Your Rubrics</h3>
                                <p className="text-lg text-muted-foreground">
                                    Create custom rubrics once, let AI grade essays and journals forever. Get detailed feedback for each student in seconds, not hours.
                                </p>
                                <ul className="space-y-3 text-foreground">
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1">✓</span>
                                        <span>Grade 120 essays in under 5 minutes</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1">✓</span>
                                        <span>Maintain your teaching standards and rubric criteria</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1">✓</span>
                                        <span>Review and adjust AI scores before finalizing</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="order-first lg:order-last">
                                <Image
                                    src='/images/custom-rubric-builder.png'
                                    width={600}
                                    height={400}
                                    alt="AI rubric grading screenshot"
                                    className="rounded-xl shadow-2xl border border-border w-full h-auto"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features Grid - Secondary Features */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Feature 2 - Auto-Graded Assessments */}
                        <div className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="mb-5 flex gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold mb-3"><span className="text-2xl">📊</span> Self-Grading Exit Tickets</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Create short answer exit tickets that AI grades instantly. No more stacks to review—get beautiful visual graphs showing class understanding in real-time.
                                    </p>
                                </div>
                            </div>
                            <Image
                                src='/images/assessment-data-v2.png'
                                width={500}
                                height={300}
                                alt="assessment data screenshot"
                                className="rounded-lg w-full h-auto border border-border"
                                priority
                            />
                        </div>

                        {/* Feature 3 - AI Anti-Cheat */}
                        <div className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="mb-6 flex gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold mb-3"><span className="text-2xl">🛡️</span> AI Anti-Cheat Editor</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Custom editor blocks copy-paste, word prediction, and spell check. See their true writing ability.
                                    </p>
                                </div>
                            </div>
                            <Image
                                src='/images/text-editor-v3.png'
                                width={500}
                                height={300}
                                alt="student text-editor screenshot"
                                className="rounded-lg w-full h-auto border border-border"
                                priority
                            />
                        </div>

                        {/* Feature 4 - Sharable Blogs */}
                        <div className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="mb-6 flex gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold mb-3"> <span className="text-2xl">✍️</span> Beautiful Student Blogs</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Turn essays into shareable blogs. Students comment, like, and engage with each other&apos;s work.
                                    </p>
                                </div>
                            </div>
                            <Image
                                src='/images/featured-blogs-v3.png'
                                width={500}
                                height={300}
                                alt="featured blogs screenshot"
                                className="rounded-lg w-full h-auto border border-border"
                                priority
                            />
                        </div>

                        {/* Feature 5 - Quick Quips */}
                        <div className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="mb-6 flex gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold mb-3"><span className="text-2xl">💬</span> Quick Quips</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Twitter-style prompts for instant engagement. Students respond without seeing others&apos; answers first.
                                    </p>
                                </div>
                            </div>
                            <Image
                                src='/images/quip-demo-v3.png'
                                width={500}
                                height={300}
                                alt="quip demo screenshot"
                                className="rounded-lg w-full h-auto border border-border"
                                priority
                            />
                        </div>
                    </div>
                </section>

                <Separator />
                {/* Demo */}
                <section className="py-16 px-6" id="app-demo-section">
                    <div className="max-w-7xl mx-auto">
                        <TextEditorDemo />
                        {/* Benefits Section */}
                        <div className="max-w-3xl mx-auto">
                            <h3 className="text-xl font-bold text-center mt-8 mb-4">Key Benefits</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                                <div className="relative flex gap-3 items-start bg-card border border-border rounded-lg p-5 pt-6 shadow-sm hover:shadow-md transition-shadow animate-[sway_6s_ease-in-out_infinite] origin-top">
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-muted border border-primary shadow-sm"></div>
                                    <span className="text-2xl">🚫</span>
                                    <div>
                                        <p className="font-semibold">Blocks AI paste</p>
                                        <p className="text-muted-foreground">Copy/paste disabled</p>
                                    </div>
                                </div>

                                <div className="relative flex gap-3 items-start bg-card border border-border rounded-lg p-5 pt-6 shadow-sm hover:shadow-md transition-shadow animate-[sway_5s_ease-in-out_infinite_0.5s] origin-top">
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-muted border border-primary shadow-sm"></div>
                                    <span className="text-2xl">✍️</span>
                                    <div>
                                        <p className="font-semibold">No autocorrect</p>
                                        <p className="text-muted-foreground">Tests real writing ability</p>
                                    </div>
                                </div>

                                <div className="relative flex gap-3 items-start bg-card border border-border rounded-lg p-5 pt-6 shadow-sm hover:shadow-md transition-shadow animate-[sway_6.5s_ease-in-out_infinite_1s] origin-top">
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-muted border border-primary shadow-sm"></div>
                                    <span className="text-2xl">✨</span>
                                    <div>
                                        <p className="font-semibold">Interactive blogs</p>
                                        <p className="text-muted-foreground">Writing becomes shareable blogs</p>
                                    </div>
                                </div>

                                <div className="relative flex gap-3 items-start bg-card border border-border rounded-lg p-5 pt-6 shadow-sm hover:shadow-md transition-shadow animate-[sway_5.5s_ease-in-out_infinite_0.3s] origin-top">
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-muted border border-primary shadow-sm"></div>
                                    <span className="text-2xl">🤖</span>
                                    <div>
                                        <p className="font-semibold">AI auto-grading</p>
                                        <p className="text-muted-foreground">Short answer questions graded instantly</p>
                                    </div>
                                </div>

                                <div className="relative flex gap-3 items-start bg-card border border-border rounded-lg p-5 pt-6 shadow-sm hover:shadow-md transition-shadow animate-[sway_7s_ease-in-out_infinite_0.7s] origin-top">
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-muted border border-primary shadow-sm"></div>
                                    <span className="text-2xl">📝</span>
                                    <div>
                                        <p className="font-semibold">Custom rubric grading</p>
                                        <p className="text-muted-foreground">Essays autograde with your rubrics</p>
                                    </div>
                                </div>

                                <div className="relative flex gap-3 items-start bg-card border border-border rounded-lg p-5 pt-6 shadow-sm hover:shadow-md transition-shadow animate-[sway_5.3s_ease-in-out_infinite_0.8s] origin-top">
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-muted border border-primary shadow-sm"></div>
                                    <span className="text-2xl">⚙️</span>
                                    <div>
                                        <p className="font-semibold">Your control</p>
                                        <p className="text-muted-foreground">Enable features per assignment</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Demo Blog */}
                <section className="py-12 px-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Section Header */}
                        <div className="text-center mb-10 space-y-4">
                            <h2 className="text-3xl sm:text-4xl font-bold">Student Blog Preview</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Every essay transforms into an interactive blog with comments, likes, and engagement features
                            </p>
                        </div>

                        {/* Blog Example */}
                        <div className="max-w-[700px] mx-auto bg-card border border-border rounded-2xl p-10 sm:p-12 shadow-lg">
                            <BlogMetaDetails
                                responseData={response}
                                studentId="1"
                                teacherView={false}
                            />
                            <Image
                                src={'https://unfinished-pages.s3.us-east-2.amazonaws.com/user-cm5bmuyhh0001zizwly9lp1td-profile-pic.jpeg-1735709463754'}
                                width={700}
                                height={394}
                                alt={'blog cover photo'}
                                className="block mx-auto mb-5 w-[700px] h-[394px]"
                                priority
                            />
                            <p className="leading-[2rem] text-foreground text-[16px] sm:text-[19px] whitespace-pre-line">{dummyBlogText}</p>
                            <Separator className="my-5" />

                            <CommentSection
                                comments={[]}
                                responseId={'1'}
                                studentId={'1'}
                                sessionId={'1'}
                                classroomId={'1'}
                                discussionStatus={'OPEN'}
                                commentCoolDown={20}
                            />
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Final CTA Section */}
                <section className="py-20 px-6 bg-gradient-to-br from-accent/10 via-primary/5 to-background">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl sm:text-5xl font-bold">
                                Get Your Evenings Back
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Join hundreds of teachers who&apos;ve reclaimed their time while giving students better feedback than ever.
                            </p>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto py-8">
                            <div>
                                <p className="text-4xl font-bold text-accent">10+</p>
                                <p className="text-sm text-muted-foreground mt-1">Hours saved weekly</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-accent">100%</p>
                                <p className="text-sm text-muted-foreground mt-1">Teacher satisfaction</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-accent">Free</p>
                                <p className="text-sm text-muted-foreground mt-1">Sign up and start using</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/sign-in">
                                <Button size="lg" className="text-lg px-10 py-7 w-full sm:w-auto">
                                    Start Free Today
                                    <span className="ml-2">→</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}