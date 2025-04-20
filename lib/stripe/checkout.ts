import { prisma } from "@/db/prisma";

// lib/stripe/checkout.ts
export async function checkout({ priceId }: { priceId: string }) {
    try {
        const res = await fetch("/api/stripe/checkout", {
            method: "POST",
            body: JSON.stringify({ priceId }),
        });

        const data = await res.json();

        if (data?.url) {
            window.location.href = data.url;
        }
    } catch (error) {
        console.log('error fetching checkout session', error)
    }
}

export async function cancelSubscription(subscriptionId: string) {
    try {
        const res = await fetch(`/api/stripe/cancel-subscription/${subscriptionId}`, {
            method: "DELETE",
        });
        const { success } = await res.json();
        if (success) return true
    } catch (error) {
        console.log('error cancelling subscription ', error)
        return false
    }
}
