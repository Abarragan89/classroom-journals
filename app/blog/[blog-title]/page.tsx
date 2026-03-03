import Image from "next/image";
import Link from "next/link";
import BlogMetaDetail from "@/components/blog-meta-details";
import { AllBlogData } from "@/data/promotion-blog-data";
import Header from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BlogCard from "@/components/blog-card";
import { Metadata } from "next";

export async function generateMetadata(
    { params }: { params: Promise<{ 'blog-title': string }> }
): Promise<Metadata> {
    const { 'blog-title': blogTitle } = await params;
    const blogData = AllBlogData[blogTitle];

    if (!blogData) return {};

    const coverImage = blogData.coverImage || '/images/open-graph-logo.png';
    const url = `https://www.jotterblog.com/blog/${blogTitle}`;

    return {
        title: `${blogData.title} | JotterBlog`,
        description: blogData.description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: blogData.title,
            description: blogData.description,
            url,
            siteName: 'JotterBlog',
            type: 'article',
            publishedTime: blogData.publishedAt,
            authors: ['Anthony Barragan'],
            images: [
                {
                    url: coverImage,
                    width: 1920,
                    height: 1080,
                    alt: blogData.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: blogData.title,
            description: blogData.description,
            images: [coverImage],
        },
    };
}

export default async function page({ params }: { params: Promise<{ 'blog-title': string }> }) {

    const { 'blog-title': blogTitle } = await params;
    const blogData = AllBlogData[blogTitle]
    const otherBlogs = Object.entries(AllBlogData).filter(([slug]) => slug !== blogTitle)


    return (
        <>
            <Header/>
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

                    {/* CTA */}
                    <div className="mt-10 flex justify-center">
                        <Button asChild size="lg" className="text-base px-8 py-6">
                            <Link href="/sign-in">
                                Try JotterBlog Today →
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Other blogs */}
                <div className="max-w-4xl mx-auto mt-14 px-4">
                    <Separator className="mb-10" />
                    <h2 className="text-2xl font-bold mb-6">More from the JotterBlog Blog</h2>
                    <div className="flex flex-wrap gap-6">
                        {otherBlogs.map(([slug, data]) => (
                            <Link key={slug} href={`/blog/${slug}`}>
                                <BlogCard
                                    title={data.title}
                                    description={data.description}
                                    coverPhotoUrl={data.coverImage || undefined}
                                    date={data.publishedAt}
                                    likeCount={0}
                                    totalCommentCount={0}
                                    author="Anthony Barragan"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </>
    )
}
