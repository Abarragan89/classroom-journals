"use client";

import { useEffect, useState } from 'react';

export default function PerformanceMonitor() {
    const [metrics, setMetrics] = useState<any>({});

    useEffect(() => {
        if (typeof window !== 'undefined' && 'performance' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.entryType === 'navigation') {
                        const navEntry = entry as PerformanceNavigationTiming;
                        setMetrics((prev: any) => ({
                            ...prev,
                            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                            totalPageLoad: navEntry.loadEventEnd - navEntry.fetchStart,
                        }));
                    }

                    if (entry.entryType === 'largest-contentful-paint') {
                        setMetrics((prev: any) => ({
                            ...prev,
                            lcp: entry.startTime,
                        }));
                    }

                    if (entry.entryType === 'first-input') {
                        const fidEntry = entry as any; // PerformanceEventTiming not in all TS versions
                        setMetrics((prev: any) => ({
                            ...prev,
                            fid: fidEntry.processingStart - fidEntry.startTime,
                        }));
                    }
                });
            });

            observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input'] });

            // Cleanup observer
            return () => observer.disconnect();
        }
    }, []);

    // Only show in development
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-lg text-xs max-w-xs">
            <h4 className="font-bold mb-2">Performance Metrics</h4>
            <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}</div>
            <div>FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}</div>
            <div>Load: {metrics.totalPageLoad ? `${Math.round(metrics.totalPageLoad)}ms` : 'N/A'}</div>
        </div>
    );
}
