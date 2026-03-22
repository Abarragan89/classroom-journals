'use client';
import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import useEmblaCarousel from 'embla-carousel-react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

// ssr: false prevents react-pdf's DOMMatrix from running in Node.js
const PdfSlide = dynamic(() => import('@/components/shared/pdf-slide'), { ssr: false });

function isPdf(url: string) {
    return url.toLowerCase().includes('.pdf');
}

function AttachmentSlide({ url }: { url: string }) {
    if (isPdf(url)) {
        return <PdfSlide url={url} />;
    }

    return (
        <div className="w-full h-[280px] overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={url}
                alt="Question attachment"
                className="w-full h-full object-cover"
            />
        </div>
    );
}

export default function AttachmentViewer({ attachments }: { attachments: string[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    if (!attachments || attachments.length === 0) return null;

    if (attachments.length === 1) {
        return (
            <div className="w-full rounded-md overflow-hidden border bg-muted/20">
                <AttachmentSlide url={attachments[0]} />
            </div>
        );
    }

    return (
        <div className="w-full rounded-md overflow-hidden border bg-muted/20 relative">
            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container flex">
                    {attachments.map((url) => (
                        <div key={url} className="embla__slide flex-[0_0_100%] min-w-0 p-2">
                            <AttachmentSlide url={url} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between w-[120px] mx-auto py-2">
                <button
                    type="button"
                    onClick={scrollPrev}
                    aria-label="Previous attachment"
                    className="text-[1.75rem] text-primary hover:opacity-70 transition-opacity"
                >
                    <IoIosArrowBack />
                </button>
                <button
                    type="button"
                    onClick={scrollNext}
                    aria-label="Next attachment"
                    className="text-[1.75rem] text-primary hover:opacity-70 transition-opacity"
                >
                    <IoIosArrowForward />
                </button>
            </div>
        </div>
    );
}
