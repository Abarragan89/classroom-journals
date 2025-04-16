import sgMail, { MailDataRequired } from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface CustomerDetails {
    customerEmail: string,
    customerName: string,
    hostedInvoice?: string,
}
///////////////////////////// Send Confirmation Email /////////////////////////////////////////
export async function subscriptionConfirmation(customerDetails: CustomerDetails): Promise<void> {

    // 1. Create the email template and send messages
    const messageId = `<${customerDetails.customerName}-${new Date().toISOString()}@unfinishedpages.com>`
    const message: MailDataRequired = {
        from: process.env.SENDGRID_ACCOUNT_EMAIL as string,
        to: customerDetails.customerEmail as string,
        subject: `JotterBlog Subscription Confirmation`,
        html: `
                <h2 style="color: #333;">Hello ${customerDetails.customerName},</h2>
                <p style="color: #555;">Thank you for subscribing to JotterBlog!</p>
                <p style="color: #555;">Here is a link to your invoice:</p>
                <p style="color: #555;">${customerDetails.hostedInvoice}></p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">You can cancel your subscription at any time from you account.</p>
                <p style="color: #555;">- JotterBlog</p>
            `,
        headers: {
            'Message-ID': messageId,
        }
    };

    sgMail.send(message).catch((error) => {
        console.error(`Failed to send email`, error.response?.body || error.message);
        return null;
    });
}

///////////////////////////// Payment Unsuccessful /////////////////////////////////////////
export async function subscriptionPaymentFailed(customerDetails: CustomerDetails): Promise<void> {
    // 1. Create the email template and send messages
    const messageId = `<${customerDetails.customerName}-${new Date().toISOString()}@unfinishedpages.com>`
    const message: MailDataRequired = {
        from: process.env.SENDGRID_ACCOUNT_EMAIL as string,
        to: customerDetails.customerEmail as string,
        subject: `JotterBlog - Payment Unsuccessful`,
        html: `
                <h2 style="color: #333;">Hello ${customerDetails.customerName},</h2>
                <p>Looks like there was an issue processing your payment.</p>
                <p>Ensure your payment details haven't change and you have sufficient funds.</p>
                <p>If you need to update you info, access your payment setting on your Account page</p>
                <p>If payment is not received, your subscription will be cancelled and you will lose access.</p>
                <p>If you have any questions, you can find our contact information on the Account page.</p>
                <p>Thank you,</p>
                <p>-JotterBlog</p>
            `,
        headers: {
            'Message-ID': messageId,
        }
    };

    sgMail.send(message).catch((error) => {
        console.error(`Failed to send email`, error.response?.body || error.message);
        return null;
    });
}


///////////////////////////// Payment Unsuccessful /////////////////////////////////////////
export async function subscriptionCancelled(customerDetails: CustomerDetails): Promise<void> {
    // 1. Create the email template and send messages
    const messageId = `<${customerDetails.customerName}-${new Date().toISOString()}@unfinishedpages.com>`
    const message: MailDataRequired = {
        from: process.env.SENDGRID_ACCOUNT_EMAIL as string,
        to: customerDetails.customerEmail as string,
        subject: `JotterBlog - Subscription Cancelled`,
        html: `
                <h2 style="color: #333;">Hello ${customerDetails.customerName},</h2>
                <p>Your subscription has been cancelled.</p>
                <p>You and your students will still have access until your current subscripion expires, but you will not be charged any further.</p>
                <p>We're sad to see you go, but you can resubscribe at any time. All of your data will be saved to the account associated with this email until the account is deleted.</p>
                <p>Thank you,</p>
                <p>-JotterBlog</p>
            `,
        headers: {
            'Message-ID': messageId,
        }
    };

    sgMail.send(message).catch((error) => {
        console.error(`Failed to send email`, error.response?.body || error.message);
        return null;
    });
}