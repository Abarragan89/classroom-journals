
import { formatDateMonthDayYear } from '@/lib/utils'
import { Response, ResponseData } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { BiMessageRounded } from 'react-icons/bi'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
export default function PrintViewBlog({
    response,
}: {
    response: Response,
}) {

    return (
        <div className='hidden print:block text-slate-400'>
            <div className="max-w-[700px] px-3 mx-auto">
                <h1 className="mx-auto text-slate-700 leading-[2rem] sm:leading-[2.2rem] text-[30px] sm:text-[36px] mb-[18px] font-[700]">{(response?.response as { answer: string }[])?.[1]?.answer}</h1>
                {/* Author information */}
                <section className="flex mx-auto">
                    <p className="relative w-[43px] h-[40px] border border-slate-400 bg-slate-300 rounded-full flex items-center justify-center">
                        {response?.student?.username?.charAt(0).toUpperCase()}
                    </p>
                    <div className="ml-2 w-full text-sm">
                        <p className="leading-5">{response.student.username}</p>
                        <div className="flex justify-between w-full">
                            <p className="leading-5">{formatDateMonthDayYear(response?.submittedAt)}</p>
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
                        <p className="mr-5 text-[.95rem]">{response.likeCount}</p>
                        <Link
                            href="#comment-section-main"
                        >
                            <BiMessageRounded
                                className="text-[1.5rem] mr-[2px] hover:cursor-pointer"
                            />
                        </Link>
                        <p className="text-[.95rem]">{response?._count?.comments ?? 0}</p>
                    </div>
                </section>

                <Image
                    src={(response?.response as { answer: string }[])?.[2]?.answer || 'https://unfinished-pages.s3.us-east-2.amazonaws.com/fillerImg.png'}
                    width={700}
                    height={330}
                    alt={'blog cover photo'}
                    className="block mx-auto mb-5 h-[330px]"
                    priority
                />
                <p className="leading-[2rem] text-black text-[16px] sm:text-[19px]">{(response.response as unknown as ResponseData[])?.[0].answer}</p>
            </div>
        </div>
    )
}
