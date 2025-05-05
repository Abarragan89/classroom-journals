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
        frequency: 'yr',
        description: 'Everything you need to use JotterBlog in your classroom everyday',
        listItems: [
            'Classroom Blogging Platform',
            'Anti-Cheat Student Text Editor',
            '1 Classroom',
            // 'Up to 10 Assignments',
            'Student Data Visualized in Graphs',
        ],
        payoutLink: '',
        teacherEmail: teacherData?.email as string
    }

    const standardPlanData: SubscriptionData = {
        name: 'Standard - Unlimited Data',
        price: 49,
        frequency: 'yr',
        description: 'Level up with more classrooms and unlimited assignments.',
        listItems: [
            'All features in Basic Plus:',
            'Up to 6 Classrooms',
            'Unlimited Assignments',
            'All student data saved'
        ],
        payoutLink: process.env.NEXT_PUBLIC_STANDARD_SUBSCRIPTION_LINK as string,
        teacherEmail: teacherData?.email as string
    }

    const premiumPlanData: SubscriptionData = {
        name: 'Premium - AI Enhanced',
        price: 99,
        frequency: 'yr',
        description: 'Automatically grades your assessments with AI! - Your New Best Friend',
        listItems: [
            'All features in Standard Plus:',
            'AI-Graded Assessments',
            'Handles short answer questions',
            'Save hours on grading!',
        ],
        payoutLink: process.env.NEXT_PUBLIC_PREMIUM_SUBSCRIPTION_LINK as string,
        teacherEmail: teacherData?.email as string
    }





    return (
        <section className='mb-20' id="subscription-section">
            <h3 className="text-lg">Subscription Plans</h3>
            <p className="text-input mb-5">cancel anytime</p>
            <div className="flex flex-col md:flex-row flex-wrap gap-10 mx-auto">
                <SubscriptionCard
                    subscriptionData={freePlanData}
                    currentSubscription={teacherData?.accountType as string}
                    subscriptionId={teacherData.subscriptionId as string}
                    updateTeacherData={updateTeacherData}
                    isCancelling={isCancelling}
                    setIsCancelling={setIsCancelling}

                />
                <SubscriptionCard
                    subscriptionData={standardPlanData}
                    currentSubscription={teacherData?.accountType as string}
                    subscriptionId={teacherData.subscriptionId as string}
                    updateTeacherData={updateTeacherData}
                    isCancelling={isCancelling}
                    setIsCancelling={setIsCancelling}

                />
                <SubscriptionCard
                    subscriptionData={premiumPlanData}
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
