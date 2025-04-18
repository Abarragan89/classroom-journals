import { prisma } from "@/db/prisma";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { subscriptionCancelled, subscriptionConfirmation, subscriptionPaymentFailed } from "@/lib/emails/stripe-emails";
import { decryptText } from "@/lib/utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Webhook signature verification failed.", err.message);
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        } else {
            console.error("Unknown error during webhook verification.", err);
            return new Response("Webhook Error: Unknown error", { status: 400 });
        }
    }

    try {
        // Handle the event
        switch (event.type) {
            case 'invoice.paid':
                // 1. Get important data to update teacher and email the user
                const invoiceHasBeenPaid = event.data.object;
                const hostedInvoice = invoiceHasBeenPaid.hosted_invoice_url as string
                const customerEmail = invoiceHasBeenPaid.customer_email as string;
                const customerName = invoiceHasBeenPaid.customer_name as string;
                const subscriptionId = invoiceHasBeenPaid?.parent?.subscription_details?.subscription as string;
                const customerId = invoiceHasBeenPaid?.customer as string;

                // get the amont paid to determine which subscription it is. 
                const amountPaid = invoiceHasBeenPaid.amount_paid
                // set variables to update depending on the plan
                const now = new Date();
                const futureDate = new Date(now);
                let accountType: string = '';
                switch (amountPaid) {
                    // testing case of 1 dollar
                    case 100:
                        futureDate.setDate(futureDate.getDate() + 1);
                        accountType = 'Premium(monthly)';
                        break;
                    case 400:
                        futureDate.setDate(futureDate.getDate() + 33);
                        accountType = 'Premium(monthly)';
                        break;
                    case 3500:
                        futureDate.setDate(futureDate.getDate() + 368);
                        accountType = 'Premium(yearly)';
                        break;
                }

                // updating the status of the teacher. Need to get student list length
                // and word problem list length in case we need to delete
                const teacher = await prisma.user.findFirst({
                    where: { email: customerEmail },
                    select: {
                        id: true,
                        customerId: true,
                    }
                });

                // // if no customerId, it's a new customer so send email
                if (teacher?.customerId) {
                    const customerDetails = {
                        customerEmail,
                        customerName,
                        hostedInvoice
                    }
                    // 2. Send confirmation email to user
                    await subscriptionConfirmation(customerDetails)
                }

                // 3. update teacher model
                await prisma.user.update({
                    where: { email: customerEmail },
                    data: {
                        subscriptionId,
                        customerId,
                        isCancelling: false,
                        subscriptionExpires: futureDate,
                        accountType
                    }
                })

                break;
            // If payment fails
            case 'invoice.payment_failed':
                const invoicePaymentFailed = event.data.object;
                const customerNamePaymentFailed = invoicePaymentFailed.customer_name as string;
                const customerEmailPaymentFailed = invoicePaymentFailed.customer_email as string;

                // set the alert for the teacher to see on their dashboard
                const userFailedPayment = await prisma.user.findFirst({
                    where: { email: customerEmailPaymentFailed },
                    select: {
                        id: true,
                    }
                });

                await prisma.alert.create({
                    data: {
                        userId: userFailedPayment?.id as string,
                        type: 'payment',
                        message: 'Your payment was unsuccessful, please review you payment info and try again.'
                    }
                })

                // send email letting user know payment was unsuccessful
                const customerDetailsFailedPayment = {
                    customerEmail: customerEmailPaymentFailed,
                    customerName: customerNamePaymentFailed,
                }
                await subscriptionPaymentFailed(customerDetailsFailedPayment)
                break;

            // If user has cancelled their subscription
            case 'customer.subscription.deleted':
                const subscriptionUpdated = event.data.object;
                const teacherCancelling = await prisma.user.findFirst({
                    where: { subscriptionId: subscriptionUpdated.id },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        iv: true,
                    }
                })

                await prisma.user.update({
                    where: { id: teacherCancelling?.id },
                    data: {
                        isCancelling: true,
                    }
                })

                const unsubscribedUser = {
                    customerEmail: teacherCancelling?.email as string,
                    customerName: decryptText(teacherCancelling?.name as string, teacherCancelling?.iv as string),
                }

                await subscriptionCancelled(unsubscribedUser)
                break;
        }

        return new Response("Webhook received", { status: 200 });
    } catch (error) {
        console.log('error in web hook user update information', error)
    }
}
