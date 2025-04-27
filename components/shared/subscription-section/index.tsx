'use client'
import { useState } from "react"
import SubscriptionCard from "./subscription-card"
import { SubscriptionData, User } from "@/types"

export default function SubscriptionSection({
    teacherData,
    updateTeacherData
}: {
    teacherData: User;
    updateTeacherData: (updatedData: Partial<User>) => void
}) {

    const [isCancelling, setIsCancelling] = useState(teacherData?.isCancelling)

    const freePlanData: SubscriptionData = {
        name: 'Basic - Free',
        price: 0,
        frequency: 'mo',
        description: 'Everything you need to use JotterBlog everyday in your classroom',
        listItems: [
            'Classroom Blogging Platform',
            'Anti-cheating Student Text Editor',
            'Assessment Data',
            'Up to 1 class',
            'Up to 15 Prompts',
            'Unlimited Assignments!',
        ],
        payoutLink: '',
        teacherEmail: teacherData?.email as string

    }
    const premiumPlanDataMonth: SubscriptionData = {
        name: 'Premium - AI Enhanced! (monthly)',
        price: 4,
        frequency: 'mo',
        description: 'Save time grading with AI!',
        listItems: [
            'Everything in Basic plus:',
            'AI Autograde!',
            'Unlimited Prompts',
            'Up to 6 classes',
        ],
        payoutLink: process.env.NEXT_PUBLIC_MONTHLY_SUB_LINK as string,
        teacherEmail: teacherData?.email as string

    }
    const premiumPlanDataYear: SubscriptionData = {
        name: 'Premium - AI Enhanced! (yearly)',
        price: 35,
        frequency: 'yr',
        description: 'Automatically grades your assessments with AI! - You\'re New Best Friend',
        listItems: [
            'Everything in Basic plus:',
            'AI Autograde!',
            'Unlimited Prompts',
            'Up to 6 classes',
        ],
        payoutLink: process.env.NEXT_PUBLIC_YEARLY_SUB_LINK as string,
        teacherEmail: teacherData?.email as string
    }


    return (
        <section className='mb-20' id="subscription-section">
            <h3 className="text-lg">Subscription Plans</h3>
            <p className="text-input mb-5">cancel anytime</p>
            <div className="flex flex-col md:flex-row flex-wrap-reverse gap-10 mx-auto">
                <SubscriptionCard
                    subscriptionData={freePlanData}
                    currentSubscription={teacherData?.accountType as string}
                    subscriptionId={teacherData.subscriptionId as string}
                    updateTeacherData={updateTeacherData}
                    isCancelling={isCancelling}
                    setIsCancelling={setIsCancelling}

                />
                <SubscriptionCard
                    subscriptionData={premiumPlanDataYear}
                    currentSubscription={teacherData?.accountType as string}
                    subscriptionId={teacherData.subscriptionId as string}
                    updateTeacherData={updateTeacherData}
                    isCancelling={isCancelling}
                    setIsCancelling={setIsCancelling}

                />
                <SubscriptionCard
                    subscriptionData={premiumPlanDataMonth}
                    currentSubscription={teacherData?.accountType as string}
                    subscriptionId={teacherData.subscriptionId as string}
                    isCancelling={isCancelling}
                    setIsCancelling={setIsCancelling}
                    updateTeacherData={updateTeacherData}

                />
            </div>
        </section>
    )
}
