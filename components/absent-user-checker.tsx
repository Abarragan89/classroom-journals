// components/AbsentUserChecker.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MAX_VISITS = process.env.NODE_ENV === "development" ? 1000 : 4;
const REDIRECT_URL = "https://abarragan89.github.io/jotter-blog-still-there/";

// Minimum gap (ms) between two counted wakes.
// If visibilitychange and focus fire within this window, we only count once.
const DEDUPE_WINDOW_MS = 7 * 60 * 1000; // 8 minutes

export default function AbsentUserChecker() {
    const pathname = usePathname();

    useEffect(() => {
        // On mount or when pathname changes, reset if needed:
        const storedPath = localStorage.getItem("lastPath");
        if (storedPath !== pathname) {
            localStorage.setItem("lastPath", pathname);
            localStorage.setItem("visitCount", "0");
            // Also clear any previous “lastIncrementTS” so we start fresh:
            localStorage.setItem("lastIncrementTS", "0");
        }

        const handleWake = () => {
            // Only count if page is actually visible
            if (document.visibilityState !== "visible") {
                return;
            }

            const now = Date.now();
            // Check the last time we incremented:
            const lastInc = parseInt(
                localStorage.getItem("lastIncrementTS") || "0",
                10
            );
            if (now - lastInc < DEDUPE_WINDOW_MS) {
                // If it’s been less than DEDUPE_WINDOW_MS since the last counted wake,
                // abort. This prevents double‐count when visibility+focus fire in quick succession.
                return;
            }

            // Record that we are now counting a new wake at time = now
            localStorage.setItem("lastIncrementTS", now.toString());

            const storedPath2 = localStorage.getItem("lastPath");
            let visitCount = parseInt(
                localStorage.getItem("visitCount") || "0",
                10
            );

            // If the user actually navigated to a different URL/pathname, reset to 1
            if (storedPath2 !== pathname) {
                localStorage.setItem("lastPath", pathname);
                localStorage.setItem("visitCount", "1");
                return;
            }

            // Otherwise, same path → increment
            visitCount += 1;
            localStorage.setItem("visitCount", visitCount.toString());

            // If we reach MAX_VISITS, clear and redirect
            if (visitCount >= MAX_VISITS) {
                localStorage.removeItem("visitCount");
                localStorage.removeItem("lastPath");
                localStorage.removeItem("lastIncrementTS");
                window.location.href = REDIRECT_URL;
            }
        };

        document.addEventListener("visibilitychange", handleWake);
        window.addEventListener("focus", handleWake);

        return () => {
            document.removeEventListener("visibilitychange", handleWake);
            window.removeEventListener("focus", handleWake);
        };
    }, [pathname]);

    return null;
}
