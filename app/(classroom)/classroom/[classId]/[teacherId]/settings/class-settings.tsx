'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Classroom } from '@/types';
import React from 'react';

export default function ClassSettings({
    classInfo
}: {
    classInfo: Classroom
}) {
    return (
        <section className='mb-20'>
            <div className="md:flex-between space-y-5 md:space-y-0">
                <div className="w-full md:mr-3 min-w-[275px]">
                    <Label>Class Name</Label>
                    <Input
                        defaultValue={classInfo?.name}

                    />
                </div>
                <div className="w-full md:ml-3 min-w-[275px]">
                    <Label>Class Size</Label>
                    <Input
                        defaultValue={classInfo?._count?.users}
                        readOnly
                        disabled
                    />
                </div>
            </div>
            <div className="md:flex-between mt-5 space-y-5 md:space-y-0">
                <div className="w-full md:mr-3 min-w-[275px]">
                    <Label>Class Code</Label>
                    <Input
                        defaultValue={classInfo?.classCode}
                        onBlur={() => console.log('how')}
                        readOnly
                        disabled
                    />
                </div>
                <div className="w-full md:ml-3 min-w-[275px]">
                    <Label>Subject</Label>
                    <Input
                        defaultValue={classInfo?.subject ?? 'N/A'}
                        onBlur={() => console.log('how')}
                    />
                </div>
            </div>
            <div className="md:flex-between mt-5 space-y-5 md:space-y-0">
                <div className="w-full md:mr-3 min-w-[275px]">
                    <Label>Period</Label>
                    <Input
                        defaultValue={classInfo?.period ?? 'N/A'}
                        onBlur={() => console.log('how')}
                    />
                </div>
                <div className="w-full md:ml-3 min-w-[275px]">
                    <Label>Year</Label>
                    <Input
                        defaultValue={classInfo?.year ?? 'N/A'}
                        onBlur={() => console.log('how')}
                    />
                </div>
            </div>
        </section>
    )
}
