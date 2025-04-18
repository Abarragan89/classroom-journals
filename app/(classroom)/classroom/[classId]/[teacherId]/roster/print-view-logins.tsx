import { User } from '@/types'

export default function PrintViewLogins({
    studentRoster,
    classCode,
}: {
    studentRoster: User[],
    classCode: string
}) {
    return (
        <div className='hidden print:block'>
            <h2 className='h1-bold text-center mb-10 text-gray-950'>Student Logins</h2>
            <div className='flex-between flex-wrap gap-x-5'>
                {studentRoster?.length > 0 && studentRoster?.map(student => (
                    <div key={student.id} className='border border-gray-950 mb-14 rounded-lg w-[290px] break-inside-avoid'>
                        <p className='text-center text-gray-950 font-bold text-md p-2'>www.jotterblog.com</p>
                        <div className="border-y border-gray-950 p-4 space-y-2">
                            <p className='font-bold text-gray-950'>Username: <span className='font-normal'>{student.username}</span></p>
                            <p className='font-bold text-gray-950'>Password: <span className='font-normal'>{student.password}</span></p>
                            <p className='font-bold text-gray-950'>Class Code: <span className='font-normal'>{classCode}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
