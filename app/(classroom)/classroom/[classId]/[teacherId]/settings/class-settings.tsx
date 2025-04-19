'use client';
import EditClassForm from '@/components/forms/class-forms/edit-class-form';
import { Class } from '@/types';
import React from 'react';

export default function ClassSettings({
    classInfo
}: {
    classInfo: Class
}) {

    return (
        <section className='mb-20'>
            <h2 className="text-2xl lg:text-3xl mt-2 mb-5">Class Settings</h2>
            <div className="flex-between mb-10 mr-5">
                <p className='text-ring'>Class Code: <span className='text-foreground py-1 px-3 bg-border rounded-full'>{classInfo?.classCode}</span></p>
                <p className='text-ring'>Class Size: <span className='text-foreground py-1 px-3 bg-border rounded-full'>{classInfo?._count?.users}</span></p>
            </div>

            {/* Edit Class Form */}
            <div className='flex-1'>
                <EditClassForm
                    classData={classInfo}
                    closeModal={() => { }}
                    isInSettingsPage={true}
                />
            </div>
        </section>
    )
}
