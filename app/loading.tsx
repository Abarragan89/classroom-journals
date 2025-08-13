"use client";
import LoadingAnimation from '@/components/loading-animation';

export default function Loading() {
    return (
        <main className='flex flex-col justify-center items-center mt-36'>
            <LoadingAnimation />
        </main>
    );
}
