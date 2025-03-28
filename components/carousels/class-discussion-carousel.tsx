import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { PromptSession } from "@/types"
import Link from "next/link";
import { formatDateLong } from "@/lib/utils";

export default function ClassDiscussionCarousel({
    blogPrompts,
}: {
    blogPrompts: PromptSession[],
}) {
    return (
        <>
            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-[85%] sm:w-[90%] mx-auto border border-border p-10 rounded-lg"
            >
                <CarouselContent>
                    {blogPrompts?.length > 0 && blogPrompts.map((session: PromptSession) => (
                        <CarouselItem key={session.id} className="md:basis-1/2 lg:basis-1/3 mx-auto">
                            <Card className="relative max-w-[350px] mx-auto">
                                <CardContent>
                                    <Link className='block' href={`/discussion-board/${session.id}/response/${session?.responses?.[0]?.id}`}>
                                        <article className='h-[150px] flex flex-col justify-between opacity-80 rounded-lg hover:cursor-pointer hover:opacity-100'>
                                            <div className="flex-between text-xs">
                                                <p>World History</p>
                                                <p>{formatDateLong(session.createdAt)}</p>
                                            </div>
                                            <p className='text-sm font-bold line-clamp-3 text-foreground'>{session.title}</p>
                                            <div className="flex-between text-xs ">
                                                <p>{session?.responses?.length} Blogs</p>
                                                <p>Discussion: <span className={`font-bold ${session.status === 'open' ? 'text-success' : 'text-destructive'}`}>{session.status}</span></p>
                                            </div>
                                        </article>
                                    </Link>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </>
    )
}
