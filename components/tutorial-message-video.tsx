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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 w-full max-w-[450px] mx-auto mt-10">
            <div className="bg-card border shadow-sm rounded-lg p-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h2>
                <p className="text-muted-foreground mb-5 text-base sm:text-lg">
                    {subtitle}
                </p>
                <CTAButton />
            </div>
            <div className="shadow-lg">
                <LiteYouTubeEmbed
                    id={youtubeId}
                    title={`JotterBlog Tutorial - Jots`}
                />
            </div>
        </div>
    )
}
