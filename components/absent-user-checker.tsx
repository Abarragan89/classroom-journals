"use client";

import { useEffect } from "react";

const MAX_VISITS = 4;
const REDIRECT_URL = "https://abarragan89.github.io/jotter-blog-still-there/";

export default function AbsentUserChecker() {
    useEffect(() => {
        const handleWakeOrFocus = () => {
            const visitCountStr = localStorage.getItem("visitCount");
            const visitCount = visitCountStr ? parseInt(visitCountStr) : 0;

            const newCount = visitCount + 1;
            localStorage.setItem("visitCount", newCount.toString());

            if (newCount >= MAX_VISITS) {
                localStorage.removeItem("visitCount");
                window.location.href = REDIRECT_URL;
            }
        };

        // Run once on mount
        handleWakeOrFocus();

        // Attach event listeners
        window.addEventListener("focus", handleWakeOrFocus);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                handleWakeOrFocus();
            }
        });

        return () => {
            window.removeEventListener("focus", handleWakeOrFocus);
            document.removeEventListener("visibilitychange", handleWakeOrFocus);
        };
    }, []);

    return null;
}
