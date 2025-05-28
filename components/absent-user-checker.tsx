"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MAX_VISITS = 5;
// Add a callBackUrl so it goes back to the exact same page
const REDIRECT_URL = "https://abarragan89.github.io/jotter-blog-still-there/";

export default function AbsentUserChecker() {
    const pathname = usePathname();

    useEffect(() => {
        const lastPath = localStorage.getItem("lastPath");
        const visitCountStr = localStorage.getItem("visitCount");
        const visitCount = visitCountStr ? parseInt(visitCountStr) : 0;

        if (lastPath === pathname) {
            const newCount = visitCount + 1;
            localStorage.setItem("visitCount", newCount.toString());

            if (newCount >= MAX_VISITS) {
                localStorage.removeItem("visitCount");
                localStorage.removeItem("lastPath");
                window.location.href = REDIRECT_URL; // full-page redirect
            }
        } else {
            localStorage.setItem("lastPath", pathname);
            localStorage.setItem("visitCount", "1");
        }
    }, [pathname]);

    return null; // no UI
}
