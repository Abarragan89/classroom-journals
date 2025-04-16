'use client'
import SubscriptionCard from "./subscription-card"
import { SubscriptionData } from "@/types"


export default function SubscriptionSection({
    teacherEmail
}: {
    teacherEmail: string
}) {

    const freePlanData: SubscriptionData = {
        name: 'Basic - Free',
        price: 0,
        frequency: 'mo',
        description: 'Everything you need to use JotterBlog everyday in your classroom',
        listItems: [
            'Classroom Blogging Platform',
            'Data anaylsis for Assessments',
            'Up to 1 classroom',
            'Create up to 30 Prompts',
            'Assign Unlimited Assessments and Blog Prompts',
        ],
        payoutLink: '',
        teacherEmail

    }
    const premiumPlanDataMonth: SubscriptionData = {
        name: 'Premium - AI Enhanced! (monthly)',
        price: 4,
        frequency: 'mo',
        description: 'Save time grading with AI!',
        listItems: [
            'Everything in Basic plus:',
            'AI automatically grades all short answer questions!',
            'Unlimited Prompts',
            'Up to 6 classes',
        ],
        payoutLink: process.env.NEXT_PUBLIC_MONTHLY_SUB_LINK as string,
        teacherEmail

    }
    const premiumPlanDataYear: SubscriptionData = {
        name: 'Premium - AI Enhanced! (yearly)',
        price: 35,
        frequency: 'yr',
        description: 'Save time grading with AI!',
        listItems: [
            'Everything in Basic plus:',
            'Assessments automatically graded by AI!',
            'Unlimited Prompts',
            'Up to 6 classes',
        ],
        payoutLink: process.env.NEXT_PUBLIC_YEARLY_SUB_LINK as string,
        teacherEmail,

    }

    return (
        <section className='mb-20'>
            <h3 className="text-lg">Subscription Plans</h3>
            <p className="text-input mb-5">cancel anytime</p>
            <div className="flex flex-col md:flex-row flex-wrap gap-10 mx-auto">
                <SubscriptionCard
                    subscriptionData={freePlanData}
                />
                <SubscriptionCard
                    subscriptionData={premiumPlanDataYear}
                />
                <SubscriptionCard
                    subscriptionData={premiumPlanDataMonth}
                />
            </div>
        </section>
    )
}
