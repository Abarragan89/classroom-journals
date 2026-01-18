'use client'
import React, { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll'
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

export default function Carousel({ children }: { children: React.ReactNode }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, }, [AutoScroll({ playOnInit: true, speed: 0.4 })])

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    return (
        <div className="embla rounded-md shadow-muted relative shadow-[inset_0_0_40px_rgba(0,0,0,0.08),inset_0_4px_20px_rgba(0,0,0,0.1),inset_0_-2px_10px_rgba(255,255,255,0.05)]">
            <div className="embla__viewport p-10 pb-2" ref={emblaRef}>
                <div className="embla__container">
                    {/* EACH CHILD MUST HAVE embla__slide CLASSNAME */}
                    {children}
                </div>
            </div>
            <div className='flex justify-between w-[180px] mx-auto mb-5 relative z-20'>
                <button className="embla__prev mt-4 text-[2.2rem] text-primary" onClick={scrollPrev}>
                    <IoIosArrowBack />
                </button>
                <button className="embla__next mt-4 text-[2.2rem] text-primary" onClick={scrollNext}>
                    <IoIosArrowForward />
                </button>
            </div>
        </div>
    )
}
