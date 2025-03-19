import { PromptSession } from '@/types'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from '@/components/ui/separator'
import { formatDateShort } from '@/lib/utils'

export default function AssignedToPopUp({ classesData }: { classesData: PromptSession[] }) {
    console.log('assigned to popup', classesData)

    // reduce the array ot get ride of duplicate classes incase it was reassigned
    // only keep the prompt session that is latest in date (most recent)
    const assignedClasses = Object.values(classesData.reduce((acc, singlePromptSession) => {
        const classId = singlePromptSession.class!.id;
        if (!acc[classId] || new Date(singlePromptSession.assignedAt) > new Date(acc[classId].assignedAt)) {
            acc[classId] = singlePromptSession; // Keep the latest entry
        }
        return acc;
    }, {} as Record<string, PromptSession>))

    // Determine the text of the 
    function assignedText() {
        switch (assignedClasses.length) {
            case 1:
                return '1 Class'
            default:
                return `${assignedClasses.length} Classes`
        }
    }

    return (
        <>
            {classesData?.length > 0 ? (
                <Popover>
                    <div className='flex-center'>
                        <p className='mr-1'>Assigned:</p>
                        <PopoverTrigger asChild>
                            <p className='hover:cursor-pointer text-accent-foreground bg-accent hover:bg-ring rounded-md py-[3px] px-2'>{assignedText()}</p>
                        </PopoverTrigger>
                    </div>
                    <PopoverContent className="w-80 p-3">
                        <p className='text-center'>Assigned To</p>
                        <Separator className='my-1 bg-ring' />
                        <div className='flex justify-between'>
                            <p className='text-sm font-bold'>Class</p>
                            <p className='text-sm font-bold'>Date</p>
                        </div>
                        {/* First  */}
                        {assignedClasses.map((singleClass) => (
                            <div key={singleClass!.class!.id}>
                                <div className='flex-between my-1'>
                                    <p className='text-sm'>{singleClass!.class!.name}</p>
                                    <p className='text-sm'>{formatDateShort(singleClass.assignedAt)}</p>
                                </div>
                            </div>
                        ))}
                    </PopoverContent>
                </Popover>
            ) : (
                <p>Assigned: <span className='text-destructive'>Never</span></p>
            )}
        </>
    )
}
