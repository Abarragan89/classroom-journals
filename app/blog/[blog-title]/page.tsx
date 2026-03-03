import Image from "next/image";
import BlogMetaDetail from "@/components/blog-meta-details";
import { AllBlogData } from "@/data/promotion-blog-data";
import Header from "@/components/shared/header";

export default async function page({ params }: { params: Promise<{ 'blog-title': string }> }) {

    const { 'blog-title': blogTitle } = await params;
    const blogData = AllBlogData[blogTitle]


    return (
        <>
            <Header
                isInBlogPage={true}
            />
            <main className="wrapper">
                <div className="max-w-[700px] mx-auto">
                    <BlogMetaDetail
                        responseData={blogData.blogMetaDataResponse}
                        studentId="1"
                        teacherView={false}
                    />
                    <Image
                        src={(blogData?.blogMetaDataResponse?.response as { answer: string }[])?.[2]?.answer || 'https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png'}
                        width={1920}
                        height={1080}
                        alt={'blog cover photo'}
                        className="block mx-auto mb-5 w-full max-w-[700px] h-auto"
                        sizes="(max-width: 700px) 100vw, 700px"
                        priority
                        fetchPriority='high'
                    />
                    <p className="leading-[2rem] text-foreground text-[16px] sm:text-[19px] whitespace-pre-line">{blogData.blogText}</p>
                </div>
            </main>
        </>
    )
}
