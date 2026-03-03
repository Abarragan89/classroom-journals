import { whatIsJotterBlog, dummyBlogText } from "./website-teacher-need-to-know"
import { studentsCheatingWithAI, studentsCheatingBlogText } from "./students-cheating-with-ai"
import { silentClassroomFix, silentClassroomBlogText } from "./silent-classroom-fix"
import { exitTicketsAreBroken, exitTicketsBlogText } from "./exit-tickets-are-broken"
import { Response } from "@/types"

export type BlogData = {
    blogMetaDataResponse: Response
    blogText: string
    title: string
    description: string
    coverImage: string
    publishedAt: string
}

export const AllBlogData: Record<string, BlogData> = {
    'jotterblog-the-website-teachers-need-to-know': {
        blogMetaDataResponse: whatIsJotterBlog,
        blogText: dummyBlogText,
        title: 'JotterBlog: The Website Teachers Need to Know',
        description: 'Discover how JotterBlog helps teachers assign writing and grade it instantly with AI — no answer keys, no multiple choice, no busywork.',
        coverImage: '/images/promotional-blog-photos/woman-happy-at-computer.webp',
        publishedAt: 'Feb 15, 2026',
    },
    'your-students-are-cheating-and-you-cant-stop-it': {
        blogMetaDataResponse: studentsCheatingWithAI,
        blogText: studentsCheatingBlogText,
        title: "Your Students Are Cheating and You Can't Stop It — Until Now",
        description: "AI detectors are inconclusive. Copy-paste is undetectable. JotterBlog's restricted editor closes every loophole so what gets submitted is genuinely your student's work.",
        coverImage: '/images/promotional-blog-photos/student-cheating-with-ai.webp',
        publishedAt: 'Jan 10, 2026',
    },
    'the-same-three-kids-always-talk-in-your-class': {
        blogMetaDataResponse: silentClassroomFix,
        blogText: silentClassroomBlogText,
        title: "The Same Three Kids Always Talk in Your Class. Here's How to Fix That",
        description: "Traditional discussion favors the bold. JotterBlog gives every student a voice — responses are private until submitted, then open for silent peer engagement.",
        coverImage: '/images/promotional-blog-photos/one-student-raising-hand.webp',
        publishedAt: 'Jan 20, 2026',
    },
    'exit-tickets-are-a-great-idea-until-you-have-to-grade-them': {
        blogMetaDataResponse: exitTicketsAreBroken,
        blogText: exitTicketsBlogText,
        title: "Exit Tickets Are a Great Idea — Until You Have to Grade Them",
        description: "Exit tickets are one of the best formative assessment tools in teaching — and one of the most impractical. JotterBlog grades short answer responses instantly, in real time.",
        coverImage: '/images/promotional-blog-photos/tired-teacher-grading-exit-tickets.webp',
        publishedAt: 'Feb 1, 2026',
    },
}
