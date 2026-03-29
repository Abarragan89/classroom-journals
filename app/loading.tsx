"use client";
import LoadingAnimation from '@/components/loading-animation';

export default function Loading() {
    return (
        <main id="main-content" className='flex flex-col justify-center items-center mt-36' aria-busy="true" aria-label="Loading page content">
            <p className="sr-only" role="status">Loading...</p>
            <LoadingAnimation />
        </main>
    );
}
