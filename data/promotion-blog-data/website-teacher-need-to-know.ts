import { Response } from "@/types"

export const whatIsJotterBlog: Response = {
    id: '8097935b-c272-48f4-8c6d-289891cba124',
    likes: [],
    likeCount: 0,
    submittedAt: new Date('2026-01-10T01:00:00.000Z'),
    response: [
        { answer: '', question: 'Blog Text' },
        { answer: 'JotterBlog: The Website Teachers Need to Know', question: 'Add a Blog Title' },
        {
            answer: '/images/promotional-blog-photos/woman-happy-at-computer.webp',
            question: 'Add a Cover Photo'
        }
    ],
    _count: { comments: 0 },
    comments: [],
    // @ts-expect-error: using Dummy Data
    student: {
        id: '94de9ffa-4753-4656-adad-32c03c5f6001',
        name: 'Anthony Barragan',
        username: 'Anthony'
    },
    // @ts-expect-error: using Dummy Data
    promptSession: { status: 'OPEN', promptType: 'BLOG' }
}

export const dummyBlogText =
    `If you've ever spent a Sunday night buried in a stack of essays while your students have already forgotten they wrote them, JotterBlog was built for you. It's a student writing platform that handles the part teachers dread most — the grading. No more choosing between meaningful writing assignments and protecting your personal time. JotterBlog gives you both.

The grading problem is real: writing assignments are the most valuable assessments in any classroom, but they're also the most time-consuming to grade. JotterBlog solves this with built-in AI grading that works the way you actually teach. Essays and journals are scored against your own custom rubrics — your categories, your standards, your expectations — so the feedback reflects your voice, not a generic algorithm. Short answer questions and exit tickets are graded instantly without an answer key or multiple choice, meaning you can create a meaningful assessment in minutes and have results before the period ends.

But JotterBlog isn't just about grading — it transforms how students experience writing altogether. When a student submits an essay or journal, it doesn't disappear into a gradebook. It becomes a fully formatted blog post that can be shared with their class, complete with a cover photo and title they chose themselves. Teachers can open posts to their classroom community, where peers can read, comment, and like each other's work. Students get a real audience for their writing, genuine peer engagement, and a natural introduction to practicing responsible social media etiquette — all inside a safe, teacher-controlled environment.`
