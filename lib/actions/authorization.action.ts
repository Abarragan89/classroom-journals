// "use server";

import { auth } from "@/auth"; // adjust if your auth import is different
import { Session } from "@/types";
// import { redirect } from "next/navigation";


export async function requireAuth() {
    const ALLOWED_ROLES = ["STUDENT", "TEACHER", "ADMIN"] as const;

    const session = await auth();

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    // console.log('session ', session)
    // if (session?.user?.id === 'c30effb8-1c4a-4778-97f7-c0110722ce65') {
    //     redirect('https://abarragan89.github.io/jotter-blog-still-there/')
    // };

    const userRole = session.user.role;

    if (!userRole || !ALLOWED_ROLES.includes(userRole.toUpperCase() as typeof ALLOWED_ROLES[number])) {
        throw new Error("Forbidden");
    }

    return session as Session;
}