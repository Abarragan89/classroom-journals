"use client";
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/types';
import ChangeAvatar from '@/components/shared/change-avatar';

export default function StudentProfileClientWrapper({
    studentInfo,
}: {
    studentInfo: User;
}) {

    return (
        <section className="mt-8">
            <h3 className="h3-bold mb-1">Student Information</h3>
            <div className="space-y-5">
                <ChangeAvatar
                    userId={studentInfo?.id}
                    avatarSrc={studentInfo?.avatarURL as string}
                />
            </div>
            <div className="md:flex-between space-y-5 md:space-y-0">
                <div className="w-full md:mr-3 min-w-[275px]">
                    <Label>Name</Label>
                    <Input
                        defaultValue={studentInfo?.name}
                        readOnly
                        disabled
                    />
                </div>
                <div className="w-full md:ml-3 min-w-[275px] relative">
                    <Label>Username</Label>
                    <Input
                        defaultValue={studentInfo?.username}
                        readOnly
                        disabled
                    />
                </div>
            </div>
        </section>
    )
}
