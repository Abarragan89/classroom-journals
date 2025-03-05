import { Prompt, PromptSession } from '@/types'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from '@/components/ui/separator'
import { formatDateShort } from '@/lib/utils'

export default function AssignedToPopUp({ classesData }: { classesData: any }) {

    function assignedText() {
        switch (classesData.length) {
            case 1:
                return '1 Class'
            default:
                return `${classesData.length} classes`
        }
    }

    return (
        <>
            {classesData?.length > 0 ? (
                <Popover>
                    <div className='flex-center'>
                        <p className='mr-1'>Assigned:</p>
                        <PopoverTrigger asChild>
                            <p className='hover:cursor-pointer text-accent-foreground bg-accent hover:bg-ring rounded-md py-[1px] px-2'>{assignedText()}</p>
                        </PopoverTrigger>
                    </div>
                    <PopoverContent className="w-80 p-3">
                        <p className='text-center'>Assigned To</p>
                        <Separator className='my-1 bg-ring' />
                        <div className='flex justify-between'>
                            <p className='text-sm font-bold'>Class</p>
                            <p className='text-sm font-bold'>Date</p>
                        </div>
                        {classesData.map((singleClass: any) => (
                            <div key={singleClass.class.id}>
                                <div className='flex-between my-1'>
                                    <p className='text-sm'>{singleClass.class.name}</p>
                                    <p className='text-sm'>{formatDateShort(singleClass.assignedAt)}</p>
                                </div>
                            </div>
                        ))}
                    </PopoverContent>
                </Popover>

            ) : (
                <p className='text-sm'>Assigned: <span className='text-destructive'>Never</span></p>
            )}
        </>
    )
}
