'use client'
import SubscriptionSection from '@/components/shared/subscription-section'
import { Separator } from '@/components/ui/separator'
import UserSettings from '@/components/user-settings'
import { User } from '@/types'
import React, { useState } from 'react'

export default function AccountClientWrapper({ decryptedTeacher }: { decryptedTeacher: User }) {
    const [teacherData, setTeacherData] = useState(decryptedTeacher);

    // Function to update account data (e.g., after canceling subscription)
    const updateTeacherData = (updatedData: Partial<User>) => {
        setTeacherData((prevData) => ({ ...prevData, ...updatedData }));
    };

    return (
        <>
            <UserSettings
                teacherData={teacherData as unknown as User}
            />
            <Separator className="my-7" />
            
            <SubscriptionSection
                teacherData={teacherData as unknown as User}
                updateTeacherData={updateTeacherData}
            />
        </>
    )
}
