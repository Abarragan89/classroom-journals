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
            {/* <div className='flex flex-col justify-between md:flex-row gap-x-10'> */}

            <div className="flex-between mb-10 mr-5">
                <p>Class Code: <span className='py-1 px-3 bg-border rounded-full'>{classInfo?.classCode}</span></p>
                <p>Class Size: <span className='py-1 px-3 bg-border rounded-full'>{classInfo?._count?.users}</span></p>
            </div>

            {/* Edit Class Form */}
            <div className='flex-1'>
                <EditClassForm
                    classData={classInfo}
                    closeModal={() => { }}
                    isInSettingsPage={true}
                />
            </div>

            {/* Uneditable class information */}
            {/* <div className='grid gap-4'>
                    <div className="w-full">
                        <Label>Class Size</Label>
                        <Input
                            defaultValue={classInfo?._count?.users}
                            readOnly
                            disabled
                        />
                    </div>
                    <div className="w-full">
                        <Label>Class Code</Label>
                        <Input
                            defaultValue={classInfo?.classCode}
                            readOnly
                            disabled
                        />
                    </div>


                </div> */}
            {/* </div> */}
        </section>
    )
}
