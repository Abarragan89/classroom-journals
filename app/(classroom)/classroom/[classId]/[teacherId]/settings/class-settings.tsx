'use client';
import EditClassForm from '@/components/forms/class-forms/edit-class-form';
import { Class } from '@/types';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

export default function ClassSettings({
    classInfo,
    teacherId,
    classId
}: {
    classInfo: Class,
    teacherId: string,
    classId: string
}) {

    const queryClient = useQueryClient();

    const { data } = useQuery({
        queryKey: ['classSettingsData', classId],
        queryFn: async () => {
            const res = await fetch(`/api/classrooms/single-class/${classId}/${teacherId}`);
            if (!res.ok) {
                throw new Error('Failed to fetch class settings data');
            }
            const data = await res.json();
            return data.classrooms as Class;

        },
        initialData: classInfo,
        staleTime: 1000 * 60 * 5,
    });

    console.log('class settings data', data);
    const classSize = data?._count?.users ? data?._count?.users - 1 : 0

    return (
        <section className='mb-20'>
            <h2 className="text-2xl lg:text-3xl mt-2 mb-5">Class Settings</h2>
            <div className="flex-between mb-10 mr-5">
                <p>Class Code: <span className='text-sm text-muted-foreground py-1 px-3 bg-muted rounded-full'>{data?.classCode}</span></p>
                <p>Class Size: <span className='text-sm text-muted-foreground py-1 px-3 bg-muted rounded-full'>{classSize}</span></p>
            </div>

            {/* Edit Class Form */}
            <div className='flex-1'>
                <EditClassForm
                    classData={data as Class}
                    isInSettingsPage={true}
                    onSuccess={(updatedData) => {
                        queryClient.setQueryData(['classSettingsData', classId], updatedData);
                    }}
                />
            </div>
        </section>
    )
}
