'use client';
import EditClassForm from '@/components/forms/class-forms/edit-class-form';
import { Class } from '@/types';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

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

    const classSize = data?._count?.users ? data?._count?.users - 1 : 0

    return (
        <section className='mb-20'>
            <h2 className="h2-bold my-3">Class Settings</h2>
            <div className="flex-between mb-5 mr-5">
                <div className='flex-center'>
                    <p>Class Code:</p>
                    <Badge className="ml-1">{data.classCode}</Badge>
                </div>
                <div className='flex-center'>
                    <p>Class Size:</p>
                    <Badge className="ml-1">{classSize}</Badge>
                </div>
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
