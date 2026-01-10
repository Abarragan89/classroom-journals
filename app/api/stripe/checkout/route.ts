// Use backend to prevent data from being seen in the client
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { Session } from '@/types';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-08-27.basil',
});

export async function POST(req: NextRequest) {

    const session = await auth() as Session;
    if (!session || !session.user?.email) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { priceId, mode } = await req.json();

    try {
        const checkoutSession = await stripe.checkout.sessions.create({
            mode,
            line_items: [{ price: priceId, quantity: 1 }],
            customer_email: session.user.email,
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
        });

        return new Response(JSON.stringify({ url: checkoutSession.url }), {
            status: 200,
        });

    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return new Response("Error creating checkout session", { status: 500 });
    }
}
