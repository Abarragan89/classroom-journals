import { whatIsJotterBlog, dummyBlogText } from "./website-teacher-need-to-know"
import { Response } from "@/types"

export type BlogData = {
    blogMetaDataResponse: Response
    blogText: string
    title: string
}

export const AllBlogData: Record<string, BlogData> = {
    'jotterblog-the-website-teachers-need-to-know': {
        blogMetaDataResponse: whatIsJotterBlog,
        blogText: dummyBlogText,
        title: 'JotterBlog: The Website Teachers Need to Know',
    },
}
