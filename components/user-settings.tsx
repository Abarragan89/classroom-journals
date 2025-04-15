'use client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User } from "@/types"

export default function UserSettings({
    teacherData,
}: {
    teacherData: User,
}) {
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
                <div className="w-full md:ml-3 min-w-[275px]">
                    <Label>Account Type</Label>
                    <Input
                        defaultValue={teacherData?.accountType}
                        readOnly
                        disabled
                    />
                </div>
            </div>
        </section>
    )
}
