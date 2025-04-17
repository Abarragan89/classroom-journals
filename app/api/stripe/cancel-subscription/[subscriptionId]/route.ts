// Use backend to prevent data from being seen in the client
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { Session } from '@/types';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
});

export async function DELETE(
    req: NextRequest,
    { params }: { params: { subscriptionId: string } }
) {
    const session = await auth() as Session;
    if (!session || !session.user?.email) {
        return new Response("Unauthorized", { status: 401 });
    }


    const { subscriptionId } = await params;

    try {
        await stripe.subscriptions.cancel(subscriptionId)
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
        });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return new Response("Error creating checkout session", { status: 500 });
    }
}
