import React from 'react'

export default async function SingleStudentView({
    params
}: {
    params: Promise<{ studentId: string }>
}) {

    const {studentId } = await params;
    
    return (
        <div>{studentId}</div>
    )
}
