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
import WelcomeToJotterBlog from "@/components/welcome-to-jotterblog";
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

The play's portrayal of adults reveals Shakespeare's critique of generational power dynamics. The Capulets and Montagues are trapped in a cycle of inherited hatred they can no longer even explain, while figures like Friar Lawrence and the Nurse, despite their good intentions, ultimately fail the young protagonists. The adults in Romeo and Juliet are either actively harmful or ineffectively helpful, creating a world where youth must forge their own path. This pattern reflects the universal experience of young people who feel misunderstood by the older generation and must choose between conformity and authentic self-expression.

Rather than viewing the tragic ending as a cautionary tale against youthful passion, we might read it as an indictment of a society that forces its young people into impossible situations. Romeo and Juliet's deaths serve as the ultimate act of rebellion—a final rejection of a world that offers them no viable path to happiness. Their sacrifice ultimately transforms Verona, ending the ancient feud and proving that sometimes youth's idealistic vision of how the world should be is more powerful than adult pragmatism. In this reading, the play becomes a testament to the transformative power of young people who refuse to accept the status quo, even at the ultimate cost.`


    return (
        <>
            <Header />
            <main className="min-h-screen bg-background relative">
                {/* Hero Section */}
                <section className="py-20 px-6 text-center relative max-w-7xl mx-auto">
                    <div className='hidden sm:flex items-baseline text-md absolute -top-[28px] right-[142px] text-accent italic font-bold opacity-0 animate-bounce-down'>
                        Try our different themes! <CornerRightUp />
                    </div>
                    <WelcomeToJotterBlog />
                    <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-6 text-primary">
                        A modern tool for teachers to manage student writing. Let AI grade student essays and journals using <span className="font-bold text-accent">your custom rubrics</span>, auto-grade assessments, and turn student essays into sharable blogs!
                    </p>

                    {/* New AI Rubric Feature Highlight */}
                    {/* <div className="bg-card border border-accent rounded-lg p-4 max-w-2xl mx-auto mb-6">
                        <p className="font-semibold mb-2">🚀 NEW: AI Rubric Grading!</p>
                        <p className="text-sm text-primary">
                            Upload your custom rubrics and let AI grade essays instantly. Save hours while maintaining your teaching standards.
                        </p>
                    </div> */}
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href="/sign-in">
                            <Button size="lg">Get Started</Button>
                        </Link>
                        <Link href="#app-demo-section">
                            <Button variant="outline" size="lg">See Demo</Button>
                        </Link>
                    </div>
                    <div className="flex flex-col items-center mt-2 text-sm rounded-lg mx-auto">
                        <p className="font-bold tracking-wide mb-2">Connects with Google Classroom!</p>
                        <Image
                            src='/images/google-classroom-logo.png'
                            width={45}
                            height={15}
                            alt='Google Classroom Logo'
                            className="rounded-lg"
                        />
                    </div>
                </section>
                <Separator />
                {/* Features */}
                <section className="py-16 px-6 max-w-7xl mx-auto">
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-6 justify-items-center">
                        {/* Card 1 - AI Rubric Grading (Image first) */}
                        <div className="rounded-lg p-6 shadow-md shadow-border border border-card flex flex-col lg:col-span-2 w-full max-w-[395px]">
                            <Image
                                src='/images/custom-rubric.png'
                                width={400}
                                height={225}
                                alt="AI rubric grading screenshot"
                                className="rounded-lg mb-4 w-full h-auto"
                            />
                            <h3 className="text-xl font-semibold mb-3">AI Rubric Grading</h3>
                            <p className="text-primary flex-grow">Create custom rubrics and let AI grade student essays and journals instantly. Maintain your teaching standards while saving hours of grading time!</p>
                        </div>

                        {/* Card 2 - Auto-Graded Assessments (Text first) */}
                        <div className="rounded-lg p-6 shadow-md shadow-border border border-card flex flex-col lg:col-span-2 w-full max-w-[395px]">
                            <h3 className="text-xl font-semibold mb-3">Auto-Graded Assessments</h3>
                            <p className="text-primary mb-4 flex-grow">Let AI grade your assessments and exit tickets. No need to make it multiple-choice, just let AI handle it and get instant data!</p>
                            <Image
                                src='/images/assessment-data.png'
                                width={400}
                                height={225}
                                alt="assessment data screenshot"
                                className="rounded-lg w-full h-auto"
                            />
                        </div>

                        {/* Card 3 - Sharable Blogs (Image first) */}
                        <div className="rounded-lg p-6 shadow-md shadow-border border border-card flex flex-col lg:col-span-2 w-full max-w-[395px]">
                            <Image
                                src='/images/featured-blogs.png'
                                width={400}
                                height={225}
                                alt="featured blogs screenshot"
                                className="rounded-lg mb-4 w-full h-auto"
                            />
                            <h3 className="text-xl font-semibold mb-3">Sharable Blogs</h3>
                            <p className="text-primary flex-grow">
                                Student writing is automatically transformed into beautiful blog posts for peers to comment and like. You can also set blogs to private for personal assignments.
                            </p>
                        </div>

                        {/* Card 4 - AI Anti-Cheat (Text first) */}
                        <div className="rounded-lg p-6 shadow-md shadow-border border border-card flex flex-col md:col-span-1 lg:col-span-2 lg:col-start-2 w-full max-w-[395px]">
                            <h3 className="text-xl font-semibold mb-3">AI Anti-Cheat</h3>
                            <p className="text-primary mb-4 flex-grow">Custom text editor disables copy and paste, word prediction and spell check. Know exactly how well your students write.</p>
                            <Image
                                src='/images/text-editor.png'
                                width={400}
                                height={225}
                                alt="student text-editor screenshot"
                                className="rounded-lg w-full h-auto"
                            />
                        </div>

                        {/* Card 5 - Quick Quips (Image first) */}
                        <div className="rounded-lg p-6 shadow-md shadow-border border border-card flex flex-col md:col-span-2 md:col-start-1 lg:col-span-2 w-full max-w-[395px]">
                            <Image
                                src='/images/quip-demo.png'
                                width={400}
                                height={225}
                                alt="quip demo screenshot"
                                className="rounded-lg mb-4 w-full h-auto"
                            />
                            <h3 className="text-xl font-semibold mb-3">Quick Quips</h3>
                            <p className="text-primary flex-grow">Quick, Twitter-style prompts where students respond without seeing others' answers first. Perfect for instant engagement and honest feedback!</p>
                        </div>
                    </div>
                </section>
                <Separator />
                {/* Demo */}
                <section className="py-16 px-6" id="app-demo-section">
                    <TextEditorDemo />
                    {/* <Separator className='mt-10 mb-6' /> */}
                    <div className="flex flex-col items-center">
                        <h5 className="font-bold text-lg mb-1">Benefits</h5>
                        <div className="text-primary space-y-2">
                            <p>✅ CANNOT copy and paste text into the editor (TRY IT!)</p>
                            <p>✅ Option to enable spell-check</p>
                            <p>✅ No distractions with font, font-sizes, formatting, images, etc.</p>
                            <p>✅ Word predication will not complete sentences</p>
                            <p>✅ Know exactly how well your students write</p>
                        </div>
                    </div>
                    <h3 className='mt-10 max-w-[850px] font-bold text-lg text-center w-full mx-auto px-5 md:px-20'>Student writing will be transformed into beautiful blogs as shown below:</h3>
                </section>

                <Separator />
                {/* Demo Blog */}
                <section className="max-w-[700px] py-12 px-10 mx-auto">
                    <h2 className='h1-bold text-center mb-10 text-input'>Example Blog</h2>
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
                </section>
                {/* <Separator />
                <section className="py-16 px-6">
                    <h2 className='h1-bold text-center'>AI Graded Assessments</h2>
                    <h3 className='font-bold text-sm text-center mb-5'>Making Data-Driven Teaching Simple and Effective</h3>
                    <Image
                        src='/images/assessment-data.png'
                        width={700}
                        height={394}
                        alt="assessment data screenshot"
                        className="rounded-lg mb-4 mt-10 sm:mt-0 mx-auto"
                    />
                    <div className="flex flex-col items-center">
                        <h5 className="font-bold text-lg mb-1">Benefits</h5>
                        <div className="text-primary space-y-2">
                            <p>- No need to make questions multiple choice</p>
                            <p>- Immediate teacher feedback</p>
                            <p>- Save hours on grading Assessments and Exit Tickets</p>
                            <p>- Graph data shows class and student performance</p>
                        </div>
                    </div>
                </section> */}
                <Separator />

                {/* Call to Action */}
                <section className="py-16 px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to simplify your classroom?</h2>
                    <p className="text-lg mb-6 text-primary">
                        Sign up today and let JotterBlog help you manage student writing and assessment
                    </p>
                    <Link href="sign-in">
                        <Button>Join Now!</Button>
                    </Link>
                </section>
            </main>
        </>
    )
}