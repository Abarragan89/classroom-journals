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

export default async function page() {

    const session = await auth() as Session;

    if (session) {
        if (session?.user?.role === 'teacher') {
            redirect(`/classes`)
        } else if (session?.user?.role === 'student') {
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
        isSubmittable: false,
        _count: { comments: 0 },
        comments: [],
        // @ts-expect-error: using Dummy Data
        student: {
            id: '94de9ffa-4753-4656-adad-32c03c5f6001',
            name: 'Flor Liera',
            username: 'Flor'
        },
        // @ts-expect-error: using Dummy Data
        promptSession: { status: 'open', promptType: 'single-question' }
    }

    const dummyBlogText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget turpis id purus fermentum volutpat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer luctus libero non sem tincidunt, ut feugiat odio tempor. Donec sed felis nec erat egestas blandit sed eget metus. Sed blandit mi non turpis fermentum, a iaculis eros viverra. Fusce fringilla, sem in porta dictum, velit justo lobortis nunc, ut tincidunt nibh nisi nec magna.

Aliquam bibendum sapien id magna congue, nec fermentum velit convallis. In volutpat imperdiet leo. Nullam tristique congue felis, vitae vulputate ante sollicitudin a. Vivamus non diam sapien. In dignissim justo sem, nec posuere nulla tincidunt nec. Integer cursus nisl non magna efficitur, a fermentum nulla accumsan. Donec et eros a risus ultrices malesuada.`


    return (
        <>
            <Header />
            <main className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="py-20 px-6 text-center">
                    <WelcomeToJotterBlog />
                    <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-6 text-primary">
                        A modern tool for teachers to manage student writing, automatically grade assessments with AI, and create sharable student blogs — all in one place.
                    </p>
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
                <section className="py-16 px-6 max-w-6xl mx-auto grid gap-6 sm:grid-cols-3 text-center">
                    <div className="mx-5 md:mx-0">
                        <h3 className="text-xl font-semibold mb-2">Auto-Graded Assessments</h3>
                        <p className="text-primary">Let AI grade your assessments. No need to make it multiple-choice, just let AI handle it!</p>
                        <Image
                            src='/images/assessment-data.png'
                            width={700}
                            height={394}
                            alt="assessment data screenshot"
                            className="rounded-lg mb-4 mt-10 sm:mt-0"
                        />
                    </div>
                    <div className="mx-5 md:mx-0 flex flex-col-reverse sm:flex-col">
                        <Image
                            src='/images/featured-blogs.png'
                            width={700}
                            height={394}
                            alt="featured blogs screenshot"
                            className="rounded-lg mb-4 mt-10 sm:mt-0"
                        />
                        <div className="flex-col sm:flex-col">
                            <h3 className="text-xl font-semibold mb-2">Sharable Blogs</h3>
                            <p className="text-primary">Turn student writing into blog posts for peers to comment and like. Set blogs to private to keep some assignments personal.</p>
                        </div>
                    </div>
                    <div className="mx-5 md:mx-0">
                        <h3 className="text-xl font-semibold mb-2">AI Anti-Cheat</h3>
                        <p className="text-primary">Custom text editor disables copy and paste, word prediction and spell check. Know exactly how well your students write.</p>
                        <Image
                            src='/images/text-editor.png'
                            width={700}
                            height={394}
                            alt="student text-editor screenshot"
                            className="rounded-lg mb-4 mt-5 sm:mt-0"
                        />
                    </div>
                </section>
                <Separator />
                {/* Demo */}
                <section className="py-16 px-6" id="app-demo-section">
                    <div className="mb-16">
                        <TextEditorDemo />
                    </div>
                    {/* <Separator className='mt-10 mb-6' /> */}
                    <div className="flex flex-col items-center">
                        <h5 className="font-bold text-lg mb-1">Benefits</h5>
                        <div className="text-primary space-y-2">
                            <p>- Cannot copy and paste text into the editor (try it!)</p>
                            <p>- No distractions with font, font-sizes, formatting, images, etc.</p>
                            <p>- Word predication will not complete sentences</p>
                            <p>- Grammar or spelling mistakes will not be highlighted</p>
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
                        discussionStatus={'open'}
                        commentCoolDown={20}
                    />
                </section>
                <Separator />
                <section className="py-16 px-6">
                    <h2 className='h1-bold text-center'>AI Graded Assessments</h2>
                    <h3 className='font-bold text-sm text-center mb-5'>Making Data-Driven Teaching Simple and Effective</h3>
                    <Image
                        src='/images/assessment-data.png'
                        width={700}
                        height={394}
                        alt="assessment data screenshot"
                        className="rounded-lg mb-4 mt-10 sm:mt-0"
                    />
                    <div className="flex flex-col items-center">
                        <h5 className="font-bold text-lg mb-1">Benefits</h5>
                        <div className="text-primary space-y-2">
                            <p>- No need to make questions multiple choice</p>
                            <p>- Immediate teacher feedback</p>
                            <p>- Save hours on grading assessments and Exit Tickets</p>
                            <p>- Graph data shows class and student performance</p>
                        </div>
                    </div>
                </section>
                <Separator />

                {/* Call to Action */}
                <section className="py-16 px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to simplify your classroom?</h2>
                    <p className="text-lg mb-6 text-primary">
                        Sign up today and let JotterBlog help you manage student writing and assessment
                    </p>
                    <Link href="sign-in">
                        <Button size="lg">Join Now!</Button>
                    </Link>
                </section>
            </main>
        </>
    )
}