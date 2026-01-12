import { PromptSession } from '@/types'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from '@/components/ui/separator'
import { formatDateShort } from '@/lib/utils'
import { Calendar } from 'lucide-react'

export default function AssignedToPopUp({ classesData }: { classesData: PromptSession[] }) {

    // reduce the array to get rid of duplicate classes in case it was reassigned
    // only keep the prompt session that is latest in date (most recent)
    const assignedClasses = Object.values(classesData.reduce((acc, singlePromptSession) => {
        const classId = singlePromptSession.class!.id;
        if (!acc[classId] || new Date(singlePromptSession.assignedAt) > new Date(acc[classId].assignedAt)) {
            acc[classId] = singlePromptSession; // Keep the latest entry
        }
        return acc;
    }, {} as Record<string, PromptSession>))

    return (
        <>
            {classesData?.length > 0 ? (
                <Popover>
                    <PopoverTrigger asChild>
                        <button className='flex items-center gap-1.5 hover:text-primary transition-colors'>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Assignment history</span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3">
                        <p className='text-center font-semibold'>Assigned To</p>
                        <Separator className='my-2' />
                        <div className='flex justify-between mb-2'>
                            <p className='text-sm font-bold'>Class</p>
                            <p className='text-sm font-bold'>Date</p>
                        </div>
                        {assignedClasses.map((singleClass) => (
                            <div key={singleClass!.class!.id}>
                                <div className='flex-between my-1.5'>
                                    <p className='text-sm'>{singleClass!.class!.name}</p>
                                    <p className='text-sm text-muted-foreground'>{formatDateShort(singleClass.assignedAt)}</p>
                                </div>
                            </div>
                        ))}
                    </PopoverContent>
                </Popover>
            ) : (
                <span className='flex items-center gap-1.5 text-muted-foreground'>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Never assigned</span>
                </span>
            )}
        </>
    )
}
