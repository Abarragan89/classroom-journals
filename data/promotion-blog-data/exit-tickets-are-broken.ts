import { Response } from "@/types"

export const exitTicketsAreBroken: Response = {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    likes: [],
    likeCount: 0,
    submittedAt: '2026-02-01T01:00:00.000Z' as unknown as Date,
    response: [
        { answer: '', question: 'Blog Text' },
        { answer: 'Exit Tickets Are a Great Idea — Until You Have to Grade Them', question: 'Add a Blog Title' },
        { answer: '/images/promotional-blog-photos/tired-teacher-grading-exit-tickets.webp', question: 'Add a Cover Photo' }
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

export const exitTicketsBlogText =
    `It's the last five minutes of class. You ask students to write one thing they learned. They scribble something. You collect 30 slips of paper. You read them tonight while dinner gets cold. By morning, the data is useless because you've already moved on. Exit tickets are one of the most powerful formative assessment tools in teaching — and one of the most impractical to actually use.

The problem isn't the concept. It's the logistics. Writing and collecting paper takes time you don't have. Digital forms take prep you didn't plan for. And no matter the format, grading 30 short answers by hand after a full teaching day is unsustainable. Most teachers end up skimming or skipping them entirely, which means the real-time insight you were after never actually gets used.

JotterBlog makes exit tickets what they were always supposed to be: fast, effortless, and genuinely useful. You write your questions on the spot — no answer key, no multiple choice, no setup — and students submit short answer responses directly. AI grades every response in real time as they come in. You can watch the results populate while students are still in their seats, and walk out of class already knowing who got it and who didn't.

That means you end every class period with clear, actionable data. Which students understood the concept. Which ones are confused. Exactly what to address tomorrow. You can write a brand new exit ticket in two minutes on any topic, any day. No prep, no pile, no guessing — just an honest read on where your class actually stands.`
