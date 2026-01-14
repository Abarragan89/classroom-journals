"use client";
import { FadeLoader } from 'react-spinners';
import { useTheme } from "next-themes"
import { useEffect, useState } from 'react';

export default function LoadingAnimation() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState<boolean>(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevents Hydration Warnings/Errors
    if (!mounted) {
        return null
    }

    function determineLoadingColor() {
        if (!theme) return '';
        switch (theme) {
            case 'light':
                return '#ae7a4c'
            case 'tech':
                return '#3de70d'
            case 'dark':
                return '#b5cae3'
            case 'cupid':
                return '#d3225d'
            case 'tuxedo':
                return '#ffffff'
            case 'avocado':
                return '#333d2f'
        }
    }

    return (
        <>
            {theme && (
                <FadeLoader
                    color={determineLoadingColor()}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    className="my-3 mx-auto"
                />
            )}
        </>
    )
}
