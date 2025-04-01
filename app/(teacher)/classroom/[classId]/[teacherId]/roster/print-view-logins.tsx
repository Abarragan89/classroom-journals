import { User } from '@/types'

export default function PrintViewLogins({
    studentRoster,
    classCode,
}: {
    studentRoster: User[],
    classCode: string
}) {
    return (
        <>
            <h2 className='h1-bold text-center mb-10'>Student Logins</h2>
            <div className='flex-between flex-wrap gap-x-5'>
                {studentRoster.map(student => (
                    <div key={student.id} className='border border-gray-950 mb-14 rounded-lg w-[290px] break-inside-avoid'>
                        <p className='text-center font-bold text-md p-2'>www.jotterblog.com</p>
                        <div className="border-y border-gray-950 p-4 space-y-2">
                            <p className='font-bold'>Username: <span className='font-normal'>{student.username}</span></p>
                            <p className='font-bold'>Password: <span className='font-normal'>{student.password}</span></p>
                            <p className='font-bold'>Class Code: <span className='font-normal'>{classCode}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
