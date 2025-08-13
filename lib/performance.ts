// Performance utilities and memoized components
import { memo, useMemo, useCallback } from 'react';

// Simple debounce function
const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// Debounced search utility
export const createDebouncedSearch = (callback: (query: string) => void, delay: number = 300) => {
    return useMemo(() => debounce(callback, delay), [callback, delay]);
};

// Memoized component factory
export const createMemoizedComponent = <T,>(Component: React.ComponentType<T>) => {
    return memo(Component);
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
    const mark = useCallback((label: string) => {
        if (typeof window !== 'undefined' && window.performance) {
            performance.mark(`${componentName}-${label}`);
        }
    }, [componentName]);

    const measure = useCallback((startMark: string, endMark: string) => {
        if (typeof window !== 'undefined' && window.performance) {
            try {
                performance.measure(
                    `${componentName}-duration`,
                    `${componentName}-${startMark}`,
                    `${componentName}-${endMark}`
                );
            } catch (error) {
                console.warn('Performance measurement failed:', error);
            }
        }
    }, [componentName]);

    return { mark, measure };
};

// Optimized image lazy loading props
export const lazyImageProps = {
    loading: 'lazy' as const,
    decoding: 'async' as const,
    placeholder: 'blur'
};
