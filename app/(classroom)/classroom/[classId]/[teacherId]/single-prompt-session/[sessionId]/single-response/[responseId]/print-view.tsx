"use client"
import { formatDateMonthDayYear } from '@/lib/utils'
import { Response, ResponseData } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { BiMessageRounded } from 'react-icons/bi'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import RubricDisplay from '@/components/rubric-display'
import { useQuery } from '@tanstack/react-query'

export default function PrintViewBlog({
    response,
    teacherId
}: {
    response: Response,
    teacherId: string
}) {
    // Use TanStack Query with initial data
    const { data: currentResponse } = useQuery({
        queryKey: ['response', response.id],
        queryFn: async () => {
            const res = await fetch(`/api/responses/${response.id}?userId=${teacherId}`);
            if (!res.ok) {
                throw new Error('Failed to fetch response');
            }
            const data = await res.json();
            return data.response as Response;
        },
        initialData: response,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    })

    return (
        <>
            <div className='hidden print:block text-slate-400 w-full'>
                <div className="max-w-[700px] mx-auto">
                    <h1 className="mx-auto text-slate-700 leading-[2rem] sm:leading-[2.2rem] text-[30px] sm:text-[36px] mb-[18px] font-[700]">{(currentResponse?.response as { answer: string }[])?.[1]?.answer}</h1>
                    {/* Author information */}
                    <section className="flex mx-auto">
                        <Image
                            src={currentResponse?.student?.avatarURL || '/images/demo-avatars/1.png'}
                            alt="blog cover photo"
                            width={38}
                            height={38}
                            className="rounded-full w-[40px] h-[40px] border border-slate-700"
                        />
                        <div className="ml-2 w-full text-sm">
                            <p className="leading-5">{currentResponse?.student?.username}</p>
                            <div className="flex justify-between w-full">
                                <p className="leading-5">{formatDateMonthDayYear(currentResponse?.submittedAt)}</p>
                            </div>
                        </div>
                    </section>
                    {/* Comment LIke Bar */}
                    <section className="flex items-center mx-auto mb-5 justify-between py-[5px] my-3 px-4 text-slate-400 border-t border-b border-slate-400">
                        <div className="flex items-center">
                            {true ?
                                <FaHeart
                                    className="text-[1.5rem] mr-[4px] hover:cursor-pointer text-red-700"
                                />
                                :
                                <FaRegHeart
                                    className="text-[1.5rem] mr-[4px] hover:cursor-pointer"
                                />
                            }
                            <p className="mr-5 text-[.95rem]">{currentResponse?.likeCount}</p>
                            <Link
                                href="#comment-section-main"
                            >
                                <BiMessageRounded
                                    className="text-[1.5rem] mr-[2px] hover:cursor-pointer"
                                />
                            </Link>
                            <p className="text-[.95rem]">{currentResponse?._count?.comments ?? 0}</p>
                        </div>
                    </section>

                    <Image
                        src={(currentResponse?.response as { answer: string }[])?.[2]?.answer || 'https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png'}
                        width={700}
                        height={394}
                        alt={'blog cover photo'}
                        className="block mx-auto mb-5 h-[394px]"
                        priority
                    />
                    <p className="leading-[2rem] text-black text-[14px] sm:text-[19px] whitespace-pre-line">{(currentResponse?.response as unknown as ResponseData[])?.[0].answer}</p>

                </div>

                {/* Rubric Grading Results - On its own page after blog content */}
                {currentResponse?.rubricGrades && currentResponse.rubricGrades.length > 0 && (
                    <div
                        className="print:block"
                        style={{
                            pageBreakBefore: 'always',
                            width: '100%',
                            minHeight: '100vh',
                            display: 'block', // Changed from 'flex' to 'block'
                            margin: 0,
                            padding: 0, // Ensure no padding
                        }}
                    >
                        <div style={{ marginTop: 0, paddingTop: 0 }}>
                            {currentResponse?.rubricGrades?.[0]?.rubric && (
                                <RubricDisplay
                                    rubricGrade={currentResponse.rubricGrades[0]}
                                    studentName={currentResponse?.student?.name || currentResponse?.student?.username}
                                    isPrintView={true}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
