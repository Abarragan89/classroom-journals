// Font optimization utilities
export const fontDisplaySwap = {
    display: 'swap' as const,
};

// Preload critical fonts
export const criticalFontPreloads = [
    { rel: 'preload', href: '/fonts/geist-sans.woff2', as: 'font', type: 'font/woff2', crossOrigin: '' },
    { rel: 'preload', href: '/fonts/geist-mono.woff2', as: 'font', type: 'font/woff2', crossOrigin: '' },
];

// Font loading strategy
export const fontLoadingStrategy = {
    preload: true,
    fallback: ['system-ui', 'arial'],
};
