import { Response } from "@/types"

export const studentsCheatingWithAI: Response = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    likes: [],
    likeCount: 0,
    submittedAt: '2026-01-10T01:00:00.000Z' as unknown as Date,
    response: [
        { answer: '', question: 'Blog Text' },
        { answer: 'Your Students Are Cheating and You Can\'t Stop It — Until Now', question: 'Add a Blog Title' },
        { answer: '/images/promotional-blog-photos/student-cheating-with-ai.webp', question: 'Add a Cover Photo' }
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

export const studentsCheatingBlogText =
    `You assigned an essay. Your student submitted it in four minutes. The writing sounds suspiciously polished. You paste it into a detector — inconclusive. You can't stop it, and they know it. If this sounds familiar, you're not alone, and it's only getting harder to catch.

The problem isn't just ChatGPT — it's how easy modern devices make cheating. Students can copy from AI, paste into a Google Doc, and submit before you've finished writing the prompt. Autocorrect fixes their mistakes, word prediction fills in their sentences, and the final product looks nothing like their actual ability. By the time you grade it, you're evaluating a tool, not a student.

JotterBlog's text editor was built specifically to close these loopholes. Copy and paste is completely disabled — there's no way to bring in outside text. Spell check, autocorrect, and word prediction are all turned off. Students have to sit, think, and type from scratch. What gets submitted is exactly what they produced — their words, their spelling, their thinking.

The result is something rare in 2026: an assignment you can actually trust. When you read a JotterBlog submission, you're reading your student. Over time, you'll see their real writing patterns, their real vocabulary, their real growth. No more wondering. No more inconclusive AI detector results. Just honest work that reflects what your students actually know.`
