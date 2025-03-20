"use server";

import { auth } from "@/auth";
import { Session } from "@/types";

async function refreshAccessToken(refreshToken: string) {
    try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.AUTH_GOOGLE_ID!,
                client_secret: process.env.AUTH_GOOGLE_SECRET!,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) throw refreshedTokens;

        return {
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, // Extend expiration
            refreshToken: refreshedTokens.refresh_token ?? refreshToken, // Keep old refresh token if not returned
        };
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return null;
    }
}

export async function getValidAccessToken() {
    const session = await auth();
    if (!session) throw new Error("User not authenticated");

    const { accessToken, refreshToken, accessTokenExpires } = session as Session;

    // If token is still valid, return it
    if (accessToken && accessTokenExpires && Date.now() < accessTokenExpires) {
        return accessToken;
    }

    // If expired, refresh it
    if (refreshToken) {
        const newTokens = await refreshAccessToken(refreshToken);
        if (newTokens) {
            return newTokens.accessToken;
        }
    }

    throw new Error("Unable to refresh access token");
}
