import { Prompt, PromptSession } from '@/types'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from '@/components/ui/separator'
import { formatDateShort } from '@/lib/utils'

export default function AssignedToPopUp({ classesData }: { classesData: any }) {

    return (
        <Popover>
            <PopoverTrigger asChild>
                <p className='hover:cursor-pointer hover:underline'>Assignments</p>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
                <p className='text-center'>Assigned To</p>
                <Separator className='my-1 bg-ring' />
                <div className='flex justify-between'>
                    <p className='text-sm font-bold'>Class</p>
                    <p className='text-sm font-bold'>Date</p>
                </div>
                {classesData?.length > 0 && classesData.map((singleClass: any) => (
                    <div key={singleClass.class.id}>
                        <div className='flex-between my-1'>
                            <p className='text-sm'>{singleClass.class.name}</p>
                            <p className='text-sm'>{formatDateShort(singleClass.assignedAt)}</p>
                        </div>
                    </div>
                ))
                }
            </PopoverContent>
        </Popover>
    )
}
