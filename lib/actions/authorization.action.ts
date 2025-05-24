"use server";

import { auth } from "@/auth"; // adjust if your auth import is different
import { Session } from "@/types";


export async function requireAuth() {
    const ALLOWED_ROLES = ["STUDENT", "TEACHER", "ADMIN"] as const;

    const session = await auth();

    // console.log('session ', session)

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const userRole = session.user.role;

    if (!userRole || !ALLOWED_ROLES.includes(userRole.toUpperCase() as typeof ALLOWED_ROLES[number])) {
        throw new Error("Forbidden");
    }

    return session as Session;
}