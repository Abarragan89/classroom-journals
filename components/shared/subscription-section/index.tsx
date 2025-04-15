'use client'
import SubscriptionCard from "./subscription-card"
import { SubscriptionData } from "@/types"
export default function SubscriptionSection() {

    const freePlanData: SubscriptionData = {
        name: 'Basic - Free',
        price: 0,
        frequency: 'mo',
        listItems: [
            'Classroom Blogging Platform',
            'Data anaylsis for Assessments',
            'Up to 1 classroom',
            'Create up to 30 Prompts',
            'Assign Unlimited Assessments',
        ],

    }
    const premiumPlanDataMonth: SubscriptionData = {
        name: 'Premium - AI Enhanced! (monthly)',
        price: 4,
        frequency: 'mo',
        listItems: [
            'Everything in Basic plus:',
            'AI automatically grades all short answer questions!',
            'Unlimited Prompts',
            'Up to 6 classes',
        ],

    }
    const premiumPlanDataYear: SubscriptionData = {
        name: 'Premium - AI Enhanced! (yearly)',
        price: 35,
        frequency: 'yr',
        listItems: [
            'Everything in Basic plus:',
            'AI automatically grades all short answer questions!',
            'Unlimited Prompts',
            'Up to 6 classes',
        ],

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
