import React from 'react'
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

export default function TutorialMessageVideo({
    title,
    subtitle,
    CTAButton,
    youtubeId
}: {
    title: string,
    subtitle: string,
    CTAButton: React.ComponentType
    youtubeId: string
}) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 w-[370px] md:w-[450px] xl:w-full mx-auto">
            <div className="flex flex-col justify-between bg-card border shadow-sm rounded-lg p-8 text-center max-w-[500px]">
                <div className='xl:max-h-[100px]'>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-5">{title}</h2>
                    <p className="text-muted-foreground mb-5 text-base sm:text-lg font-medium">
                        {subtitle}
                    </p>
                    <div className='mt-8 xl:mt-16 w-fit mx-auto'>
                        <CTAButton />
                    </div>
                </div>
            </div>
            <div className="shadow-lg max-w-[500px]">
                <LiteYouTubeEmbed
                    id={youtubeId}
                    title={`JotterBlog Tutorial - Jots`}
                />
            </div>
        </div>
    )
}
