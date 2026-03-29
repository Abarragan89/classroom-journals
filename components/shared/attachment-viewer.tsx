'use client';
import dynamic from 'next/dynamic';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { useState } from 'react';


// ssr: false prevents react-pdf's DOMMatrix from running in Node.js
const PdfSlide = dynamic(() => import('@/components/shared/pdf-slide'), { ssr: false });

function isPdf(url: string) {
    return url.toLowerCase().includes('.pdf');
}

function AttachmentSlide({ url }: { url: string }) {
    const [style, setStyle] = useState({ aspectRatio: '4/5' }); // default while loading

    if (isPdf(url)) {
        return <PdfSlide url={url} />;
    }

    return (
        <div className="w-full overflow-hidden rounded-lg" style={style}>
            <img
                src={url}
                alt="Question attachment"
                loading="lazy"
                className="w-full h-full object-cover"
                onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    const { naturalWidth, naturalHeight } = img;
                    const ratio = naturalWidth / naturalHeight;
                    setStyle({ aspectRatio: ratio > 4 / 5 ? `${naturalWidth}/${naturalHeight}` : '4/5' });
                }}
            />
        </div>
    );
}

export default function AttachmentViewer({ attachments }: { attachments: string[] }) {

    if (!attachments || attachments.length === 0) return null;

    if (attachments.length === 1) {
        return (
            <div className="w-full rounded-md overflow-hidden border bg-muted/20">
                <AttachmentSlide url={attachments[0]} />
            </div>
        );
    }

    return (
        <div className="w-full rounded-md bg-muted/20">
            <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent className='items-center'>
                    {attachments.map((url, index) => (
                        <CarouselItem key={index} className="w-full p-0">
                            <AttachmentSlide url={url} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </Carousel>
        </div>
    );
}
