'use client';

import { useEffect, useState } from 'react';

export default function WelcomeToJotterBlog() {

    const [index, setIndex] = useState(0);
    const fullText = 'JotterBlog';

    useEffect(() => {
        if (index < fullText.length) {
            const timeout = setTimeout(() => {
                setIndex((prev) => prev + 1);
            }, 150); // typing speed
            return () => clearTimeout(timeout);
        }
    }, [index]);

    return (
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Welcome to <span className="text-accent">{fullText.slice(0, index)}</span>
        </h1>
    )
}
