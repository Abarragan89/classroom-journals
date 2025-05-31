"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MAX_VISITS = process.env.NODE_ENV === "development" ? 6 : 1000;
const REDIRECT_URL = "https://abarragan89.github.io/jotter-blog-still-there/";

export default function AbsentUserChecker() {
    const pathname = usePathname();

    useEffect(() => {
        const storedPath = localStorage.getItem("lastPath");

        if (storedPath !== pathname) {
            // If path changes, reset visit count
            localStorage.setItem("lastPath", pathname);
            localStorage.setItem("visitCount", "0");
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                const currentPath = localStorage.getItem("lastPath");
                let visitCount = parseInt(localStorage.getItem("visitCount") || "0", 10);

                if (currentPath === pathname) {
                    visitCount += 1;
                    localStorage.setItem("visitCount", visitCount.toString());

                    if (visitCount >= MAX_VISITS) {
                        // Reset everything and redirect
                        localStorage.removeItem("visitCount");
                        localStorage.removeItem("lastPath");
                        window.location.href = REDIRECT_URL;
                    }
                } else {
                    // User switched to a new path
                    localStorage.setItem("lastPath", pathname);
                    localStorage.setItem("visitCount", "1");
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [pathname]);

    return null;
}
