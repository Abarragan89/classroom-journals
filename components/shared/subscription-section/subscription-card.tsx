import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { checkout } from "@/lib/stripe/checkout";
import { SubscriptionData } from "@/types";
import { cancelSubscription } from "@/lib/stripe/checkout";
import { useState } from "react";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Input } from "@/components/ui/input";

export default function SubscriptionCard({
    subscriptionData,
    currentSubscription,
    subscriptionId,
    isCancelling,
    setIsCancelling

}: {
    subscriptionData: SubscriptionData;
    currentSubscription: string;
    subscriptionId: string;
    isCancelling: boolean;
    setIsCancelling: React.Dispatch<React.SetStateAction<boolean>>;

}) {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [userConfirmationText, setUserConfirmationText] = useState<string>('')

    async function handleCancelSubscription() {
        try {
            setIsLoading(true)
            const isCancelled = await cancelSubscription(subscriptionId)
            if (isCancelled) {
                setIsCancelling(true)
                setIsModalOpen(false)
            } else {
                throw new Error('error deleting sub')
            }
        } catch (error) {
            console.log('error cancelling subscription ', error)
        } finally {
            setIsLoading(false)
        }
    }

    function generateBtn(subPlanName: string, currentSubPlan: string) {
        if (subPlanName.includes('Free')) {
            return <Button disabled>Always Free</Button>
        }
        // Handle Monthly if subscribed or disabled
        if (currentSubPlan.includes('monthly') && subPlanName.includes('monthly') && !isCancelling) {
            return <Button variant='destructive' onClick={() => setIsModalOpen(true)}>Unsubscribe</Button>

        } else if (currentSubPlan.includes('monthly') && !subPlanName.includes('monthly') && !isCancelling) {
            return <Button disabled>You must first Unsubscribe</Button>
        }
        // Handle Yearly if subscribed or disabled
        if (currentSubPlan.includes('yearly') && subPlanName.includes('yearly') && !isCancelling) {
            return <Button variant='destructive' onClick={() => setIsModalOpen(true)}>Unsubscribe</Button>

        } else if (currentSubPlan.includes('yearly') && !subPlanName.includes('yearly') && !isCancelling) {
            return <Button disabled>You must first Unsubscribe</Button>
        }

        // Show Subscription Button
        return (
            <Button className="bg-success"
                onClick={() => {
                    checkout({
                        priceId: subscriptionData.payoutLink.toString(),
                    });
                }}
            >
                Subscribe
            </Button>
        )
    }

    return (
        <>
            <ResponsiveDialog
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                title="Confirm Cancellation"
                description="Confirm your subscription cancellation"
            >
                <p>Are you sure you want to cancel your subscription?</p>
                <p>Type &lsquo;confirm cancellation&lsquo; to confirm</p>
                <Input
                    type="text"
                    onChange={(e) => setUserConfirmationText(e.target.value)}
                />
                <Button
                    disabled={userConfirmationText !== 'confirm cancellation' || isLoading}
                    variant='destructive'
                    onClick={handleCancelSubscription}
                >
                    {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
                </Button>
            </ResponsiveDialog>
            <article className="flex-1 flex flex-col justify-between border border-secondary rounded-lg p-5 min-w-[250px]">
                <div>
                    <p className="font-bold">{subscriptionData.name}</p>
                    <p className="text-[2.5rem] mt-5">${subscriptionData.price}<span className="text-[1rem]">/{subscriptionData.frequency}</span></p>
                    <p className="text-sm text-input">{subscriptionData.description}</p>
                </div>
                <Separator className="my-5" />
                <ul>
                    {subscriptionData.listItems.map((listItem) => (
                        <li
                            key={listItem}
                            className="list-disc ml-5 my-3"
                        >
                            {listItem}
                        </li>
                    ))}
                </ul>
                <Separator className="my-5" />
                {generateBtn(subscriptionData.name, currentSubscription)}
            </article>
        </>
    )
}
