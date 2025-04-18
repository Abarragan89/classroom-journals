'use client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDateMonthDayYear } from "@/lib/utils"
import { User } from "@/types"

export default function UserSettings({
    teacherData,
}: {
    teacherData: User,
}) {

    const today = new Date();
    const isSubscriptionValid = teacherData?.subscriptionExpires ? teacherData?.subscriptionExpires > today : false;
    const isCancelling = teacherData.isCancelling;
    const accountStatus = isSubscriptionValid ? teacherData?.accountType : 'Basic-Free'

    return (
        <section className="mt-8">
            <h3 className="text-lg mb-1">Account Information</h3>
            <div className="md:flex-between space-y-5 md:space-y-0">
                <div className="w-full md:mr-3 min-w-[275px]">
                    <Label>Name</Label>
                    <Input
                        defaultValue={teacherData?.name}
                        readOnly
                        disabled
                    />
                </div>
                <div className="w-full md:ml-3 min-w-[275px]">
                    <Label>Email</Label>
                    <Input
                        defaultValue={teacherData?.email}
                        readOnly
                        disabled
                    />
                </div>
            </div>
            <div className="md:flex-between mt-5 space-y-5 md:space-y-0">
                <div className="w-full md:mr-3 min-w-[275px]">
                    <Label>Username</Label>
                    <Input
                        defaultValue={teacherData?.username}
                        onBlur={() => console.log('how')}
                    />
                </div>
                <div className="w-full md:ml-3 min-w-[275px] relative">
                    <Label>Account Type</Label>
                    <Input
                        defaultValue={accountStatus}
                        readOnly
                        disabled
                    />
                    {isCancelling && 
                        <p
                        className="text-xs text-destructive absolute top-1 right-2"
                        >Expires: {formatDateMonthDayYear(teacherData?.subscriptionExpires)}</p>
                    }
                </div>
            </div>
        </section>
    )
}
