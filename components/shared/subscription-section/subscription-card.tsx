import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SubscriptionData } from "@/types";
export default function SubscriptionCard({ subscriptionData }: { subscriptionData: SubscriptionData }) {


    return (
        <article className="flex-1 flex flex-col justify-between border border-input rounded-lg p-5">
            <div>
                <p className="font-bold">{subscriptionData.name}</p>
                <p className="text-[2.5rem] mt-5">${subscriptionData.price}<span className="text-[1rem]">/{subscriptionData.frequency}</span></p>
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
            {subscriptionData.name.includes('Free') ? (
                <Button disabled>Always Free</Button>
            ): (
                <Button className="bg-success">Subscribe</Button>
            )}

        </article>
    )
}
