'use client'
import { useState } from "react"
import SubscriptionCard from "./subscription-card"
import { SubscriptionData, User } from "@/types"
import { Button } from "@/components/ui/button"
import { checkout } from "@/lib/stripe/checkout"

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
            'Up to 1 Classroom',
            'Grade with Custom Rubrics',
            'Create Assessments Exit/Tickets'
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
            'Create up to 6 Classrooms',
            'Unlimited Assignments',
            'Unlimited student data saved',
            'Graphical Student Data Visualizations',
        ],
        payoutLink: process.env.NEXT_PUBLIC_STANDARD_SUBSCRIPTION_LINK as string,
        teacherEmail: teacherData?.email as string
    }

    const premiumPlanData: SubscriptionData = {
        name: 'Premium - AI Enhanced!',
        price: 99,
        frequency: 'yr',
        description: 'Automatically grades with AI! - Your New Best Friend',
        listItems: [
            'All features in Standard Plus:',
            'AI-Graded Exit Tickets / Assessments (unlimited)',
            'AI-Graded Essays / Blogs with custom rubrics (150 credits/month)',
            'Instant student feedback',
            'Save hours on grading!',
        ],
        payoutLink: process.env.NEXT_PUBLIC_PREMIUM_SUBSCRIPTION_LINK as string,
        teacherEmail: teacherData?.email as string
    }


    return (
        <section className='mb-10' id="subscription-section">

            {/* <div className="flex justify-between mb-5"> */}
            <div>
                <h3 className="text-lg">Subscription Plans</h3>
                <p className="text-input">cancel anytime</p>
                {/* AI Credits Banner */}
                <div>
                    <article className="w-full">
                        <div className="my-5">
                            <p className="mb-1 text-sm">
                                Let AI grade essays with your custom rubrics with <span className="underline">no subscription?</span>
                            </p>
                            <Button
                                className="bg-success !text-success-foreground"
                                onClick={() => {
                                    checkout({
                                        priceId: process.env.NEXT_PUBLIC_AI_CREDITS_LINK as string,
                                        mode: 'payment',
                                    });
                                }}                        
                            >
                                One-time Purchase to Buy AI Credits
                            </Button>
                        </div>
                    </article>
                </div>
            </div>
            {/* </div> */}

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
