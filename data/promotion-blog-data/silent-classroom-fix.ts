import { Response } from "@/types"

export const silentClassroomFix: Response = {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    likes: [],
    likeCount: 0,
    submittedAt: '2026-01-20T01:00:00.000Z' as unknown as Date,
    response: [
        { answer: '', question: 'Blog Text' },
        { answer: 'The Same Three Kids Always Talk in Your Class. Here\'s How to Fix That', question: 'Add a Blog Title' },
        { answer: '/images/promotional-blog-photos/one-student-raising-hand.webp', question: 'Add a Cover Photo' }
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

export const silentClassroomBlogText =
    `You ask a question. Three hands go up — the same three that always go up. Everyone else stares at the desk, hoping you won't call on them. You wait five seconds. Nothing. You move on. The class discussion problem has never been about your students not having thoughts — it's that the format was never built for all of them.

Traditional discussion favors the bold. Students who process quickly, speak confidently, or simply don't mind being wrong in front of 30 peers dominate every conversation. Meanwhile, your most thoughtful students stay quiet — not because they have nothing to say, but because the room rewards speed over depth. Those students leave class every day with something unsaid.

JotterBlog changes that dynamic. When you post a discussion prompt, students write and submit their responses independently — and they can't see anyone else's answer until they've written their own. No anchoring to the first thing someone said, no copying the loud kid, no social pressure. Every student has to think for themselves before the conversation opens up.

Once responses are in, students can read, comment on, and like each other's work — at their own pace, in silence. It's the substance of a classroom discussion without the chaos. Students who never raise their hand suddenly have a real voice. And as a bonus, it's a natural introduction to respectful online communication — practicing the social media etiquette they'll need long after they leave your classroom.`
