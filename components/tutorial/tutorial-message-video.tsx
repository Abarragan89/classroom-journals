import React from 'react'
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

export default function TutorialMessageVideo({
    title,
    subtitle,
    CTAButton,
    youtubeId,
    isInClassroom = true
}: {
    title: string,
    subtitle: string,
    CTAButton: React.ComponentType
    youtubeId: string,
    isInClassroom?: boolean
}) {
    return (
        <div className={`
        grid grid-cols-1 gap-14 justify-items-center mx-auto max-w-[1040px]
        ${isInClassroom ? 'xl:grid-cols-2' : 'lg:grid-cols-2'}
        `}>
            <div className="flex flex-col justify-between bg-card border shadow-sm rounded-lg p-8 text-center w-full max-w-[500px]">
                <div className=''>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-5">{title}</h2>
                    <p className="text-muted-foreground mb-5 text-base sm:text-lg font-medium">
                        {subtitle}
                    </p>
                    <div className='w-fit mx-auto mt-10'>
                        <CTAButton />
                    </div>
                </div>
            </div>
            <div className="w-full max-w-[500px] shadow-lg">
                <LiteYouTubeEmbed
                    id={youtubeId}
                    title={`JotterBlog Tutorial - Jots`}
                />
            </div>
        </div>
    )
}
